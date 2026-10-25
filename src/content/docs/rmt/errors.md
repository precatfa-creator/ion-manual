---
title: رسائل RMT ومعانيها
description: كل رسالة خطأ في مسار حجوزات الاشتراكات — سببها وحلّها.
sidebar:
  order: 7
---

الرسائل تظهر بالإنجليزية كما في الواجهة. `…` مكان اسم أو قيمة.

## عند حفظ الحجز

| الرسالة | السبب | الحل |
| --- | --- | --- |
| **National ID must be exactly 12 digits** | الرقم الوطني ليس 12 رقماً (بعد حذف المسافات والشرطات) | صحّح الرقم واحفظ — [القواعد](/rmt/booking/#قواعد-الرقم-الوطني) |
| **The birth year in the National ID (…) does not match the Date of Birth (…)** | الأرقام 2–5 لا تطابق سنة الميلاد | صحّح أحدهما |
| **Region … is not in City …** | المنطقة المختارة ليست داخل المدينة | اختر المدينة أولاً ثم منطقة من قائمتها |
| **Distributor … is not active** | **Status** الموزّع ليس Active | فعّل الموزّع أو اختر غيره |
| **Distributor … covers … only, not …** | مكان الحجز خارج مدينة/منطقة الموزّع | اختر موزّعاً يغطي المكان، أو صحّح تغطية الموزّع |
| **Add at least one item** | جدول الأصناف فارغ | أضف صنفاً في تبويب Billings |
| **Subscription Type … has no items; add them to its Items table** | النوع بلا أصناف مسموحة | أضف الأصناف إلى [نوع الاشتراك](/rmt/setup/#نوع-الاشتراك-subscription-type) |
| **Row …: Item … is not an item of Subscription Type …** | صنف من خارج النوع (مثلاً بعد تغيير النوع) | احذف الصف أو أضف الصنف إلى النوع |
| **Select the Subscription Type first** | اخترت صنفاً قبل النوع | اختر النوع في تبويب Details أولاً |

## عند التأكيد

| الرسالة | السبب | الحل |
| --- | --- | --- |
| **Set Company, Selling Price List on Distributor … first** | ينقص إعداد الموزّع | املأها في [Booking Settings](/rmt/setup/#الموزّع-تبويب-booking-settings) |
| **No price for … on Price List …; add an Item Price, then save the booking again** | صنف بلا سعر على قائمة الموزّع | أضف Item Price، ثم احفظ الحجز ليُعاد حسابه |
| **The booking has no price; save it again to recalculate** | الإجمالي صفر | احفظ الحجز مرة أخرى، وراجع الأسعار |
| **Distributor … has no modes of payment** | جدول طرق الدفع للموزّع فارغ | أضف طريقة دفع واحدة على الأقل |
| **Payments must add up to …** | مجموع المبالغ ≠ الإجمالي | عدّل المبالغ حتى يصبح شريط المبلغ أخضر |
| **Attach the document for …** | طريقة تتطلب مرفقاً بمبلغ دون مرفق | ارفع المستند (مثل صورة الصك) |
| **Upload the personal files: …** | ملف شخصي ناقص | ارفع الملفات الأربعة |
| **Distributor is set to create a Payment Entry, but you are not allowed to submit Payment Entries** | لا تملك صلاحية اعتماد Payment Entry | يؤكّد مستخدم يملكها، أو تُمنح لك |
| **Please set default Cash or Bank account in Mode of Payment …** | طريقة الدفع بلا حساب للشركة | أضف الحساب في Mode of Payment → Accounts |
| **Service Category and BA Transaction Type required …** | مؤكِّد الحجز يملك أحد أدوار مدير الحسابات | انظر [التنبيه في صفحة التأكيد](/rmt/confirm/#إلغاء-حجز-مؤكد) |

## بعد التأكيد

| الرسالة | السبب | الحل |
| --- | --- | --- |
| **This booking already has a Sales Order or Sales Invoice** / **…already has Sales Invoice …** / **…already has Installation Note …** | المستند موجود | افتح المستند الموجود من Connections |
| **Submit Sales Order … before invoicing it** | أمر البيع ما زال مسودة | اعتمد أمر البيع ثم أنشئ الفاتورة |
| **Confirm the booking first** | الحجز غير مؤكَّد | أكّده أولاً |
| **Serial No is mandatory for Item …** | صنف تسلسلي بلا رقم في إشعار التركيب | أدخل الأرقام التسلسلية — [إكمال التركيب](/rmt/installation/#إكمال-التركيب) |
| **Cancel Sales Invoice … before cancelling this booking** | للحجز فاتورة معتمدة | ألغِ قيود الدفع والفاتورة أولاً |
| **Cancel Installation Note … before cancelling this booking** | للحجز إشعار تركيب معتمد | ألغِ الإشعار أولاً |
| **Only confirmed bookings have an RMT contract** | جلب العقد لحجز غير مؤكَّد | أكّد الحجز أولاً |
| **RMT API is not configured: set rmt_api_url and rmt_api_key in site_config.json** | الاتصال بـ ION RMT غير مضبوط | [لمسؤول النظام](/rmt/setup/#إعداد-الاتصال-بنظام-ion-rmt-لمسؤول-النظام) |
| **Could not reach RMT: …** | تعذّر الوصول إلى ION RMT | أعد المحاولة؛ يسجَّل الخطأ في Error Log |
| **RMT has no contract for this booking yet** (تنبيه برتقالي) | لم يُصدر RMT عقداً بعد | أعد المحاولة لاحقاً |

## في الموزّع والتقارير

| الرسالة | السبب | الحل |
| --- | --- | --- |
| **User … is listed more than once** | المستخدم مكرر في جدول Users | احذف التكرار |
| **User … already belongs to Distributor …** | المستخدم مرتبط بموزّع آخر | أزله من الموزّع الآخر أولاً |
| **You don't have permission to get a report on: Installation Note** | الدور بلا صلاحية Report على Installation Note | انظر [Pending Installations](/rmt/reports/#pending-installations) |
| **You don't have access to Report: …** | التقرير غير متاح لدورك | انظر جدول التقارير في [تقارير RMT](/rmt/reports/) |
