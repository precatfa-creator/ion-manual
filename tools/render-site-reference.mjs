// Render a reviewable apply_patch patch from the private read-only audit.
// Does not write documentation or access the site itself.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const audit = JSON.parse(fs.readFileSync(process.argv[2] || '/tmp/ion-manual-site-audit.json', 'utf8'));
const coverage = JSON.parse(fs.readFileSync(path.join(root, 'tools/manual-coverage.json'), 'utf8'));
const marker = '<!-- BEGIN VERIFIED SITE REFERENCE -->';
const cell = value => String(value ?? '—').replaceAll('|', '&#124;').replaceAll('\n', ' ').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const code = value => '`' + cell(value) + '`';
const table = (headers, rows) => '\n| ' + headers.join(' | ') + ' |\n| ' + headers.map(() => '---').join(' | ') + ' |\n' + rows.map(r => '| ' + r.map(cell).join(' | ') + ' |').join('\n') + '\n';
const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
// audits before audited_on existed were all taken on 2026-09-12
const [year, month, day] = (audit.audited_on || '2026-09-12').split('-').map(Number);
const auditDate = day + ' ' + MONTHS[month - 1] + ' ' + year;
const status = value => ({0:'مسودة (0)',1:'معتمد (1)',2:'ملغى (2)'}[value] || value);
function transitionCondition(t) {
  if (!t.condition?.trim()) return 'لا شرط إضافي في الانتقال';
  if (t.condition.includes('reports_to')) return 'المستخدم هو المدير المباشر المرتبط بموظف الطلب (Reports To → User ID)';
  if (t.condition.includes('doc.approver')) return 'المستخدم هو Approver المحدد على الطلب';
  if (t.condition.includes('doc.is_signed')) return 'Is Signed مفعّل';
  if (t.condition.includes('Material Issue')) return 'Purpose = Material Issue أو Material Transfer';
  if (t.condition.includes('Request for Quotation')) return 'Purpose = Request for Quotation';
  if (t.condition.includes('Purchase')) return 'Purpose = Purchase';
  throw new Error('Unreviewed transition condition: ' + t.condition);
}
const notificationConditions = {
  'RFQ MR Notify': 'Created By Employee وغرض Request for Quotation',
  'Technical Team Approval': 'قاعدة قديمة: Hardware/Software لغير الصرف والنقل بعد موافقة الشراء/المشاريع، أو عندما يكون المشروع فارغاً؛ ليست مرحلة موافقة حالية',
  'Accounts Manager Approval': 'تعتمد Approved By Technical Team غير الموجودة في السير الحالي؛ وتستثني الصرف والنقل وتشترط Hardware/Software',
  'Purchase Manager Approval': 'Created By Employee أو حالات IT/HR القديمة، مع استبعاد الصرف والنقل',
  'Project Manager Approval': 'مسودة Hardware/Software مرتبطة بمشروع، بعد Approved By Purchase Manager، باستثناء الصرف والنقل',
  'mr1': 'تفحص Status = Created By Employee لمسودة صرف/نقل؛ لا تفحص Workflow State، لذلك لا تفترض تحققها',
  'Material Request Receipt Notification': 'Status = Received أو Partially Received',
  'Late Attendance Notify': 'وجود وقت الدخول والخروج وعلامة Late Entry ودقائق تأخير أكبر من صفر',
  'leave application notfication': 'عند الحفظ؛ مستلم Leave Approver مشروط بوجود عناوين مديري المشاريع',
};
const fieldLabel = (dt, name) => ({owner:'منشئ المستند',opportunity_owner:'Opportunity Owner',custom_employee_email:'بريد الموظف',custom_employee_user:'مستخدم الموظف',custom_technical_user:'Technical User القديم (غير موجود بالنموذج الحالي)'}[name] || audit.doctypes[dt]?.fields.find(f => f.fieldname === name)?.label || name);
function notificationCondition(n) {
  if (notificationConditions[n.name]) return notificationConditions[n.name];
  if (!n.condition?.trim()) return 'دون شرط عام إضافي';
  const state = n.condition.match(/workflow_state\s*==\s*["']([^"']+)/);
  if (state) {
    const active = audit.workflows.find(w => w.document_type === n.document_type);
    return 'Workflow State = ' + state[1] + (active && !active.states.some(s => s.state === state[1]) ? '؛ حالة قديمة خارج السير الحالي' : '');
  }
  if (n.condition.includes('fulfilment_status')) return 'Fulfilment Status مفعّل';
  const simple = n.condition.match(/^doc\.([a-z_]+)$/i);
  if (simple) return fieldLabel(n.document_type, simple[1]) + ' مفعّل';
  throw new Error('Unreviewed notification condition: ' + n.name);
}
function notifications(dt) {
  const ns = audit.notifications.filter(n => n.document_type === dt);
  if (!ns.length) return '\n**الإشعارات:** لا توجد قاعدة Notification مستقلة مفعلة لهذا النوع في لقطة المراجعة. قد تنطبق معالجات التطبيق المذكورة في الشرح أو معالج ION العام عند وجود workflow_state؛ غياب القاعدة ليس دليلاً على غياب كل تنبيه.\n';
  return '\n**قواعد الإشعارات المفعّلة:** البريد يخضع لقيد الإرسال التجريبي المذكور أعلاه؛ تنبيه الجرس مبين منفصلاً.\n' + table(['القاعدة','متى؟','الشرط/حدود الاستخدام','المستلم','القناة'],ns.map(n => {
    const events = {'Value Change':'تغير '+fieldLabel(dt,n.value_changed),'Days Before':n.days_in_advance+' يوم قبل '+fieldLabel(dt,n.date_changed),'New':'الإنشاء','Save':'الحفظ','Submit':'الاعتماد'};
    const recipients = n.recipients.map(r => [r.receiver_by_role, r.receiver_by_document_field && fieldLabel(dt,r.receiver_by_document_field)].filter(Boolean).join(' + ') || 'مستلم مخصص؛ يراجعه المسؤول في القاعدة').join('؛ ');
    return [n.name,events[n.event]||n.event,notificationCondition(n),recipients,n.channel==='System Notification'?'جرس النظام':n.channel+(n.send_system_notification?' + جرس النظام':' فقط')];
  }));
}
// options.automatic: the documents are created by the application itself (e.g. on Confirm),
// so having none yet does not mean the screen is unused
function section(dt,purpose,options={}) {
  const d = audit.doctypes[dt];
  if (!d) throw new Error('Missing audited DocType: '+dt);
  let out = '\n### '+dt+'\n\n**الدور:** '+purpose+'\n';
  if (d.count === 0 && options.automatic) out += '\n*لا توجد سجلات محفوظة وقت المراجعة؛ هذه المستندات ينشئها التطبيق تلقائياً عند الخطوة الموضحة في الشرح.*\n';
  else if (d.count === 0) out += '\n*الشاشة متاحة في الإعداد، لكن لم توجد لها سجلات محفوظة وقت المراجعة؛ لا يُفترض أنها خطوة يومية مستخدمة أو مطلوبة لمجرد وجودها.*\n';
  const grouped = new Map();
  for (const p of d.permissions) {
    const key = JSON.stringify([p.permlevel||0,p.read,p.create,p.write,p.submit,p.cancel,p.if_owner]);
    if (!grouped.has(key)) grouped.set(key,[]);
    if (!grouped.get(key).includes(p.role)) grouped.get(key).push(p.role);
  }
  out += '\n**صلاحيات الأدوار الفعلية** (تظل قيود السجلات والحالة والشروط سارية):\n';
  out += table(['الدور/الأدوار','مستوى الحقول','قراءة','إنشاء','تعديل','اعتماد','إلغاء','القيد'], [...grouped].map(([key,roles])=>{
    const [level,read,create,write,submit,cancel,owner] = JSON.parse(key);
    return [roles.join('، '),level,...[read,create,write,submit,cancel].map(v=>v?'نعم':'—'),owner?'سجلات يملكها المستخدم فقط':'بحسب النطاق المسموح'];
  }));
  const wf = audit.workflows.find(w => w.document_type === dt);
  if (wf) {
    out += '\n**سير العمل النشط:** '+code(wf.name)+'. استخدم قائمة الإجراءات؛ لا تعدل حقل الحالة يدوياً. دور الانتقال لا يمنح حقوق القراءة/الكتابة/الاعتماد الناقصة.\n';
    out += table(['من الحالة','الإجراء','إلى الحالة','الدور المنفّذ','الشرط','حالة المستند بعده'],wf.transitions.map(t=>[t.state,t.action,t.next_state,t.allowed,transitionCondition(t),status(wf.states.find(s=>s.state===t.next_state)?.doc_status)]));
    out += '\n<details>\n<summary>من يحرر المستند في كل حالة؟</summary>\n\nالدور أدناه هو Allow Edit في إعداد الحالة، ويضاف إلى حقوق الحقول ونطاق السجل.\n';
    out += table(['الحالة','دور تحرير الحالة','حالة المستند'],wf.states.map(s=>[s.state,s.allow_edit,status(s.doc_status)]));
    out += '\n</details>\n\nبريد Workflow القياسي **غير مفعّل** لهذا السير. يمكن أن تعمل قواعد Notification ومعالجات التطبيق بشكل مستقل عنه.\n';
  } else out += '\n**سير العمل:** لا يوجد Workflow نشط لهذا النوع وقت المراجعة. '+(d.is_submittable?'المستند قابل للاعتماد القياسي؛ Save ثم Submit حسب الصلاحية والتحقق، وأي حقل Status وصفي لا يعرّف سلسلة موافقات بالأدوار.':d.issingle?'هذه شاشة إعداد واحدة تحفظ إعداداتها؛ لا تمر بمراحل Submit/Cancel.':'المستند يُحفظ دون Submit؛ حقل الحالة إن وجد لا يعني Workflow مستقلاً.')+'\n';
  return out + notifications(dt);
}
let patch = '*** Begin Patch\n';
for (const [route, entries] of Object.entries(coverage)) {
  if (process.argv[3] && route !== process.argv[3]) continue;
  const file = 'src/content/docs/'+route+'.md';
  const original = fs.readFileSync(path.join(root,file),'utf8').trimEnd();
  const body = original.split(marker)[0].trimEnd();
  const generated = '\n\n'+marker+'\n\n## مرجع الأدوار وسير العمل والإشعارات\n\nتمت المراجعة من إعدادات **testsite.local — '+auditDate+'**. مستوى 0 هو الحقوق الأساسية؛ المستويات الأعلى تخص مجموعات حقول محددة. علامة — تعني أن صف الدور لا يمنح الحق. لا تجمع الصور كل أدوار المستخدمين؛ الصور التقطت بحساب الإدارة.\n\n**تنبيه البريد:** [سكربت موقع الاختبار يضع البريد في Sent دون إرساله](/users/active-scripts/). تابع المستند والتنبيهات المتاحة داخل النظام.\n'+entries.map(([dt,purpose,options])=>section(dt,purpose,options)).join('')+'\n<!-- END VERIFIED SITE REFERENCE -->';
  const updated = body+generated;
  if (original !== updated) patch += '*** Update File: '+file+'\n@@\n'+original.split('\n').map(l=>'-'+l).join('\n')+'\n'+updated.split('\n').map(l=>'+'+l).join('\n')+'\n';
}
patch += '*** End Patch';
process.stdout.write(patch);
