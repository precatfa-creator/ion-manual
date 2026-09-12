---
title: السكربتات والإشعارات الفعّالة
description: أثر Client Scripts وServer Scripts الحالية وحدود الإشعارات في testsite.local.
sidebar:
  order: 2
---

تمت مراجعة **18 Client Script مفعلاً** و**6 Server Scripts غير معطّلة** في قاعدة بيانات **testsite.local** بتاريخ **12 سبتمبر 2026**. تشغيل Server Scripts مفعّل على الموقع. تمت قراءة السكربتات ومقارنتها بالحقول وسير العمل ومعالجات التطبيقات دون تعديل أي منها.

## قبل الاعتماد على البريد

السكربت **Just to Test**، على **Email Queue / After Insert**، يغيّر حالة الرسالة وصفوف مستلميها إلى **Sent**. لا ينفذ إرسال بريد. لذلك قد تظهر الرسالة «مرسلة» دون أن تصل إلى صندوق البريد. وجود حساب بريد صادر مفعّل لا يلغي هذا الأثر.

استخدم المستند وحالته وإشعارات الجرس المتاحة للمتابعة، وأبلغ المسؤول عند غياب التنبيه. لم يُجرَ اختبار إرسال بريد إلى أشخاص ضمن مراجعة الدليل.

## Client Scripts: أثرها على الاستخدام

| الاسم المسجل | DocType | الأثر الذي يجب أن يعرفه المستخدم |
| --- | --- | --- |
| Fixed Material Request | Material Request | يملأ الموظف والقسم، يفلتر الأصناف بنوع المادة، ويمسح الأصناف عند تغييره؛ يقيد Technical Administration Staff بالصرف، ويقيد نوع المادة إلى Hardware/Software لمن لا يحمل Department Manager؛ ما زال يحوي منطق مراجعة فنية قديماً |
| Opportunity | Opportunity | يفلتر الأصناف بنوع المادة ويمسحها عند تغييره؛ يضيف Create → Material Request لسجل محفوظ غير Lost |
| Opportunity Hotels Workflow | Opportunity Hotels | يجلب الجنسية والأسعار والتقييم والتوفر من العميل وقائمة الأسعار والمخزن؛ يتحكم بقائمة Create، ويحاول التقدم عند حفظ المتطلبات والنطاق |
| Opportunity SM Workflow | Opportunity SM | جلب بيانات العميل والأسعار والتوفر، والتحكم بقائمة Create ومحاولة التقدم عند استكمال المتطلبات والنطاق |
| Opportunity Tenders Workflow | Opportunity Tenders | جلب الأسعار والتوفر والجنسية؛ محاولة الانتقال من Scoping إلى Surveying عند اكتمال وصف النطاق وفريق CXO وقائده |
| Restrict Edit Status | Leave Application | يقصر تغيير الحالة في الواجهة على Leave Approver المحدد، مع استثناء Administrator؛ لا توجد قاعدة منع موافقة ذاتية في الشرط الحالي |
| ex | Expense Claim | يملأ الموظف والقسم ومعتمد المصروفات من ملف الموظف ويقفل الحقول عند إنشاء الطلب |
| Attendance Request | Attendance Request | يملأ الموظف والقسم من الحساب ويقفل الحقول عند إنشاء الطلب |
| Attendance Request1 | Attendance Request | يخفي السبب Late من قائمة الأسباب؛ يستخدم الموظف Late Entry Request للتبرير |
| DNfromSI | Delivery Note | يضيف Get Items From → Sales Invoice للمسودة، بفواتير معتمدة لا تحدّث المخزون |
| Auto Job Opening Route | Job Opening | يولد Route من Job Title؛ يزيل الأحرف غير اللاتينية، لذا يجب مراجعة رابط العنوان العربي |
| Auto Job Question Fieldname | Job Question Set | يعيّن معرف السؤال عند إضافة صف Job Question |
| Subscription Renew | Subscription | يضيف Renew (Prefill) خلال 30 يوماً من الانتهاء أو بعده؛ يفتح اشتراكاً جديداً غير محفوظ يبدأ بعد نهاية السابق ويُنسخ إليه جدول الخطط |
| Quotation Create Subscription | Quotation | يضيف إنشاء اشتراك من عرض معتمد له فرصة مصدر؛ يجهز مسودة تحتاج مراجعة العميل والخطط ثم الحفظ؛ كاشف المصدر لا يشمل ISP في هذا السكربت |
| Intercompany Stock Transfer Rate | Intercompany Stock Transfer | يحسب Available Qty من Bin في المسودة فقط، ويتوقف عن تحديثه بعد الاعتماد أو الإلغاء |
| Purchase Order | Purchase Order | يعرض الملاحظات والأنشطة المخصصة |
| Purchase Receipt | Purchase Receipt | يعرض الملاحظات والأنشطة المخصصة |
| Purchase Invoice | Purchase Invoice | يعرض الملاحظات والأنشطة المخصصة |

Client Script يغيّر سلوك المتصفح؛ لا يعني وجود اسمه أنه Workflow مستقل أو أنه يمنح صلاحية خادم. قد تتفاعل السكربتات مع ملفات JavaScript المحملة من التطبيقات؛ يجب مراجعة الشاشة النهائية بعد الحفظ.

## Server Scripts: أثرها على المعاملات

| الاسم | الحدث وDocType | الأثر |
| --- | --- | --- |
| Restrict Material Request Type for Technical Administration Staff | Material Request — Before Save | يمنع حفظ غرض غير Material Issue عند وجود هذا الدور؛ لا توجد أدوار استثناء مهيأة |
| Just to Test | Email Queue — After Insert | يضع الرسالة والمستلمين في حالة Sent دون إرسال فعلي |
| Intercompany Transfer | Intercompany Stock Transfer — After Submit | يتحقق من الشركات والمخازن والحسابات، وينشئ الصرف والاستلام وقيود التسوية عند قيمة موجبة |
| Cancel Intercompany Transfer | Intercompany Stock Transfer — After Cancel | يلغي المستندات المعتمدة المرتبطة؛ يمنع الإتمام عند فشل إلغاء أي منها ويحتفظ بالروابط |
| update deductions of paid payment_entry | Payment Entry — Before Validate | يحول مبالغ الخصم الموجبة إلى سالبة عندما يكون Payment Type = Receive |
| Dedicated Quotation | Quotation — Before Insert | يحاول تعبئة Opportunity From؛ لكنه يبحث عن اسم سجل الفرصة داخل DocType، لذلك لا تعتمد عليه وحده لتصنيف المصدر؛ معالج التطبيق يضيف تصنيف المصدر أيضاً |

## قواعد الإشعارات

هناك **68 Notification مفعلة**. القواعد ذات **System Notification** أو **Send System Notification** قد تضيف تنبيه جرس؛ القواعد البريدية وحدها لا تضمن ذلك. الجداول في فصول المستندات تبين المستلمين والحدث والشرط والقناة.

كل الـ **15 Workflow النشطة** لديها **Send Email Alert = 0**. هذه القيمة تخص بريد Workflow القياسي، ولا توقف قواعد Notification أو رسائل معالجات التطبيقات.

### عدم تطابق إشعارات طلب المواد مع السير

السير الحالي لا يتضمن Approved By Technical Team أو Approved By Projects Manager أو Review By Applicant. مع ذلك، توجد إشعارات مفعلة تعتمد بعض هذه الحالات أو الحقل القديم custom_technical_user. هذه القواعد لا تُثبت وجود مرحلة فنية مستخدمة.

قاعدة **Technical Team Approval** تضم شرطاً يسمح بتحققها عندما يكون المشروع فارغاً، بسبب موضع OR في التعبير؛ لا تفهم رسالتها على أنها إجراء موافقة واجب. وبعض إشعارات المخازن تفحص Status بدلاً من Workflow State. راجع الحالة وزر الإجراء الفعلي.

### ملاحظات من الشاشة ومن معالجات التطبيق

- ظهر عند فتح Material Request الخطأ **get_department_technical_reviewers is not defined**؛ يستدعي السكربت دالة قديمة غير معرفة في الشاشة المحملة. قد يتوقف ما بعدها من معالج refresh، فلا تفترض أن كل محتوى السكربت ينفذ بنجاح.
- دالة ION التي تجمع مستلمي Material Request تعود دون قائمة مستخدمين في الشفرة الحالية. قواعد Notification المستقلة تبقى منفصلة عنها؛ لا تتوقع رسائل المعالج العام لهذا النوع لمجرد وجوده في hooks.
- مهمة إخطار Purchase Receipt اليومية تشير إلى دالة تحتاج doc وmethod؛ لا يمرر استدعاء الجدولة المعتاد هذين الوسيطين، لذلك لم يوثق الدليل ملخصاً يومياً ناجحاً.
- ظهرت أيضاً أخطاء واجهة أثناء التصوير لبعض النماذج، وبعض الطلبات الخلفية حُجبت لحماية البيانات أثناء الالتقاط. لا يُنسب خطأ طلب محجوب تلقائياً إلى عطل بالنظام. لقطة النموذج لا تثبت نجاح حفظه أو اعتماده.

### حدود التحقق

النتائج تثبت الإعداد والمنطق المقروء وقت المراجعة، ولا تثبت تسليم بريد أو نجاح جميع المسارات مالياً وتشغيلياً. لم تُحفظ طلبات أو تُعتمد معاملات أو تُشغّل مزامنة BioTime لأجل الاختبار. لم تُعدّل أكواد/JSON التطبيقات أو سكربتات الموقع، ولم يُشغّل bench migrate.
