"""Read-only site inspection. Run with the bench Python from its sites directory.

Produces a private audit artifact, not application fixtures. No document saves,
workflow actions, migrations, or commits are performed.
"""
import json
from pathlib import Path
import frappe

SITE = "testsite.local"
OUTPUT = Path("/tmp/ion-manual-site-audit.json")
frappe.init(site=SITE, sites_path="/home/frappe/frappe-bench/sites")
frappe.connect()
try:
    frappe.db.rollback()
    frappe.db.sql("START TRANSACTION READ ONLY")
    apps = frappe.get_installed_apps()
    modules = frappe.get_all("Module Def", fields=["name", "app_name"])
    custom_modules = [m.name for m in modules if m.app_name not in ("frappe", "erpnext", "hrms", "payments")]
    names = set(frappe.get_all("DocType", filters={"module": ["in", custom_modules], "istable": 0}, pluck="name"))
    names.update(["Material Request", "Item", "Department", "Purchase Order", "Purchase Receipt", "Purchase Invoice", "Supplier", "Supplier Quotation", "Request for Quotation", "Warehouse", "Employee", "User", "Role", "User Permission", "Opportunity", "Quotation", "Sales Order", "Sales Invoice", "Payment Entry", "Journal Entry", "Sales Person", "Sales Partner", "Customer", "Issue", "Appraisal", "Appraisal Cycle", "Appraisal Template", "Shift Type", "Attendance", "Employee Checkin", "Salary Slip", "Payroll Entry", "Additional Salary", "Employee Transfer", "Employee Promotion", "Job Applicant", "Job Opening", "Stock Entry", "Project", "Notification", "Workflow"])
    workflows = [frappe.get_doc("Workflow", n).as_dict() for n in frappe.get_all("Workflow", filters={"is_active": 1}, pluck="name")]
    names.update(w.document_type for w in workflows)
    names.update(frappe.get_all("Client Script", filters={"enabled": 1}, pluck="dt"))
    names.update(frappe.get_all("Server Script", filters={"disabled": 0, "script_type": "DocType Event"}, pluck="reference_doctype"))
    names.update(frappe.get_all("Notification", filters={"enabled": 1}, pluck="document_type"))
    names.update(["Salary Structure Assignment", "Salary Structure", "Shift Assignment", "Subscription Plan", "Installation Note"])
    doctypes = {}
    for name in sorted(names):
        if not frappe.db.exists("DocType", name):
            continue
        meta = frappe.get_meta(name, cached=False)
        doctypes[name] = {
            "module": meta.module, "issingle": meta.issingle, "is_submittable": meta.is_submittable,
            "fields": [{k: f.get(k) for k in ("fieldname", "label", "fieldtype", "options", "hidden", "reqd", "read_only", "depends_on", "mandatory_depends_on", "read_only_depends_on", "permlevel", "default", "description")} for f in meta.fields],
            "permissions": [p.as_dict() for p in meta.permissions],
            "count": None if meta.issingle else frappe.db.count(name),
        }
    notifications = [frappe.get_doc("Notification", n).as_dict() for n in frappe.get_all("Notification", filters={"enabled": 1}, pluck="name")]
    clients = frappe.get_all("Client Script", filters={"enabled": 1}, fields=["name", "dt", "view", "script"])
    servers = frappe.get_all("Server Script", filters={"disabled": 0}, fields=["name", "script_type", "reference_doctype", "doctype_event", "script"])
    hooks = {key: frappe.get_hooks(key) for key in ("doc_events", "doctype_js", "override_doctype_class", "permission_query_conditions", "has_permission", "scheduler_events")}
    result = {"site": SITE, "audited_on": str(frappe.utils.getdate()), "apps": apps, "doctypes": doctypes, "workflows": workflows, "notifications": notifications, "client_scripts": clients, "server_scripts": servers, "hooks": hooks,
              "blocked_notifications": frappe.get_all("Notification Blocked Doctypes", pluck="name"),
              "email_outgoing_enabled": bool(frappe.db.count("Email Account", {"enable_outgoing": 1})),
              "server_script_enabled": bool(frappe.conf.get("server_script_enabled")),
              "scheduler_disabled": bool(frappe.conf.get("disable_scheduler")),
              "material_types": frappe.get_all("Material Type", pluck="name")}
    def serializable(value):
        if isinstance(value, dict):
            return {str(k): serializable(v) for k, v in value.items()}
        if isinstance(value, (list, tuple)):
            return [serializable(v) for v in value]
        return value
    OUTPUT.write_text(json.dumps(serializable(result), ensure_ascii=False, indent=2, default=str))
    print(f"Read-only audit: {len(doctypes)} DocTypes, {len(workflows)} active workflows, {len(notifications)} enabled notifications. Artifact: {OUTPUT}")
finally:
    frappe.db.rollback()
    frappe.destroy()
