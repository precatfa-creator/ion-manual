"""Pass an existing local Administrator session to the screenshot subprocess.

No passwords are read, sessions created, or configuration changed. Stdout is
consumed in memory by screenshots.mjs and must never be logged or committed.
"""
import json
import frappe

frappe.init(site="testsite.local", sites_path="/home/frappe/frappe-bench/sites")
frappe.connect()
try:
    rows = frappe.db.sql("select sid from tabSessions where user=%s and status=%s order by lastupdate desc limit 20", ("Administrator", "Active"), as_dict=True)
    print(json.dumps([r.sid for r in rows]))
finally:
    frappe.db.rollback()
    frappe.destroy()
