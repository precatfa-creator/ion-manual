---
title: الموزّعون والحجوزات
description: بيانات الموزّعين، تصنيفهم، والحجوزات التي تُنفَّذ عبرهم.
sidebar:
  order: 4
---

## الموزّع (Distributor)

سجل رئيسي لكل **موزّع أو وكيل** يبيع باقات/فاوتشرات الشركة.

أين أجده؟ اكتب في شريط البحث: `موزع` أو `Distributor`

![نموذج موزّع](../../../assets/screens/form-distributor.jpg)

| الحقل | ماذا يعني |
| --- | --- |
| **Distributor Name** | الاسم التجاري للموزّع |
| **Distributor Code/ID** | كود فريد يُنشأ **تلقائياً** عند إنشاء السجل — لا تُدخله يدوياً |
| **Distributor Category** | جدول: Agent / Home Cards Wholesale / Hotspot Cards Wholesale / E-Payment Company / POS |
| **Distribution Type** | جدول: Home Vouchers / Hotspot Vouchers / Equipment\Devices / اشتراك |
| **Voucher Distribution Type** | جدول: Paper (ورقي) / Electronic (إلكتروني) |
| **شريك المبيعات** (Sales Partner) | يُنشأ ويُربَط **تلقائياً** عند إنشاء الموزّع |
| **المستودعات، الترخيص وصلاحيته** | بيانات تشغيلية وقانونية |

:::note[كود الموزّع وشريك المبيعات يُنشآن تلقائياً]
عند حفظ موزّع جديد لأول مرة، ينشئ ION تلقائياً **كوداً فريداً** له ويربطه بسجلّ **شريك مبيعات (Sales Partner)** مطابق. لا تحتاج لإنشاء شريك المبيعات يدوياً بشكل منفصل.
:::

## فرع العميل (Branch Customer)

سجل بسيط يسمّي **فرع أو موقع عميل** — يُستخدم اسم الفرع نفسه كاسم السجل. راجعه عند الحاجة لتمييز فروع عميل واحد له أكثر من موقع.

## الحجز (Booking)

مستند نقطة بيع (POS-style) يسجّل **بيعاً واحداً لباقة أو فاوتشر** عبر موزّع محدَّد.

أين أجده؟ اكتب في شريط البحث: `Booking`

![نموذج حجز](../../../assets/screens/form-booking.jpg)

| القسم | الحقول |
| --- | --- |
| **Core Info** | Package ID*، Client Name*، الموقع*، Package Price*، Client National ID*، Contract Number، الحالة، Client Phone*، Distributor ID* |
| **المالية** | Commission Percent، Company Share، Distributor Commission، Client Credit، طريقة الدفع أو السداد، دفع مبلغ، Payment Status |
| **Audit** | Created At، Confirmed At، Cancelled At، Refunded Amount — تواريخ تُسجَّل تلقائياً مع المنطقة الزمنية (Africa/Tripoli) |

**Invoice References** (جدول فرعي) يربط الحجز بفاتورة أو أكثر من فواتير المبيعات الصادرة عنه، مع تاريخ الإضافة.

الحالات الممكنة: **Pending** (معلّق) → **Confirmed** (مؤكَّد) / **Cancelled** (ملغى) / **Failed** (فاشل).

:::tip[سلسلة الترقيم]
اسم كل حجز يتبع الصيغة `RMT-{السنة}{الشهر}{اليوم}-{تسلسل}` — مما يسهّل معرفة تاريخ الحجز مباشرة من اسمه دون فتحه.
:::
