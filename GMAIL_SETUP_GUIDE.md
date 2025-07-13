# 📧 Gmail Setup Guide - إعداد Gmail

## 🚨 حل مشكلة "Username and Password not accepted"

### المشكلة المشتركة:
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

### السبب:
Gmail لا يقبل كلمة المرور العادية للتطبيقات الخارجية. يجب استخدام **App Password**.

---

## 📋 الحل خطوة بخطوة (بالعربية)

### 1. تفعيل المصادقة الثنائية (2FA)
1. اذهب إلى [Google Account Settings](https://myaccount.google.com/)
2. اختر "الأمان" (Security)
3. تحت "تسجيل الدخول إلى Google"
4. اختر "التحقق بخطوتين" (2-Step Verification)
5. اتبع التعليمات لتفعيل 2FA

### 2. إنشاء App Password
1. في نفس صفحة الأمان
2. اختر "App passwords" (كلمات مرور التطبيقات)
3. اختر "Mail" للتطبيق
4. اختر "Other" للجهاز واكتب "Portfolio Website"
5. اضغط "Generate"
6. **انسخ كلمة المرور المكونة من 16 حرف**

### 3. تحديث .env.local
```env
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=abcd efgh ijkl mnop  # كلمة المرور المكونة من 16 حرف
CONTACT_EMAIL=raneem.althaqafi@example.com
```

**⚠️ مهم**: استخدم كلمة المرور المكونة من 16 حرف، وليس كلمة مرور Gmail العادية!

---

## 📋 Step-by-Step Solution (English)

### 1. Enable Two-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click "Security"
3. Under "Signing in to Google"
4. Click "2-Step Verification"
5. Follow the setup instructions

### 2. Create App Password
1. In the same Security page
2. Click "App passwords"
3. Select "Mail" for app
4. Select "Other" for device and type "Portfolio Website"
5. Click "Generate"
6. **Copy the 16-character password**

### 3. Update .env.local
```env
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=abcd efgh ijkl mnop  # The 16-character password
CONTACT_EMAIL=raneem.althaqafi@example.com
```

**⚠️ Important**: Use the 16-character App Password, NOT your regular Gmail password!

---

## 🔧 التحقق من الإعدادات

### تحقق من .env.local:
```env
# ✅ صحيح
SMTP_USER=example@gmail.com
SMTP_PASS=abcdefghijklmnop  # 16 characters, no spaces in file
CONTACT_EMAIL=raneem.althaqafi@example.com

# ❌ خطأ
SMTP_PASS=your-regular-gmail-password  # This won't work!
```

### اختبار الإعدادات:
```bash
# إعادة تشغيل الخادم
npm run dev

# جرب إرسال رسالة من نموذج الاتصال
```

---

## 🐛 حلول للمشاكل الشائعة

### 1. لا يمكن رؤية "App passwords"
**الحل**: تأكد من تفعيل 2FA أولاً

### 2. "App passwords" غير متوفر
**الحل**: 
- تأكد من تفعيل 2FA
- تأكد من أن الحساب ليس حساب عمل (Work account)

### 3. كلمة المرور لا تعمل
**الحل**:
- تأكد من نسخ كلمة المرور كاملة (16 حرف)
- لا تتضمن مسافات في .env.local
- استخدم كلمة المرور الجديدة وليس القديمة

### 4. خطأ "Less secure app access"
**الحل**: App Passwords تتجاهل هذا الإعداد تلقائياً

---

## 🧪 اختبار سريع

### كود للاختبار:
```javascript
// Test in browser console after setting up
fetch('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    message: 'Test message'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

### النتيجة المتوقعة:
```json
{ "success": true }
```

---

## 📞 إذا استمرت المشكلة

1. **تأكد من البيانات**:
   - عنوان البريد الإلكتروني صحيح
   - كلمة المرور 16 حرف
   - لا توجد مسافات إضافية

2. **جرب كلمة مرور جديدة**:
   - احذف كلمة المرور القديمة من Google
   - أنشئ كلمة مرور جديدة

3. **تحقق من السجلات**:
   - راجع console logs للتفاصيل
   - تأكد من تحديث .env.local

## ✅ النتيجة النهائية

بعد اتباع هذه الخطوات، يجب أن يعمل نموذج الاتصال بدون مشاكل!

---

## 📧 تنسيق .env.local النهائي

```env
# Gmail Configuration (صحيح)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password-here
CONTACT_EMAIL=raneem.althaqafi@example.com

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-key-here

# Eleven Labs Configuration
ELEVENLABS_API_KEY=your-elevenlabs-key-here
ELEVENLABS_VOICE_ID=your-voice-id-here
``` 