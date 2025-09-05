# نظام نقطة البيع (POS System)

نظام نقطة بيع شامل مبني باستخدام React Native و Expo مع قاعدة بيانات محلية وإدارة المستخدمين.

## المميزات

- 🛒 نظام نقطة بيع كامل
- 📦 إدارة المنتجات
- 🧾 إنشاء الفواتير والإيصالات
- 📊 تقارير المبيعات
- 👥 إدارة المستخدمين
- 🔐 نظام تسجيل الدخول
- 🖨️ إعدادات الطباعة
- 🏪 إعدادات المطعم
- 💾 قاعدة بيانات محلية

## متطلبات النظام

### الأدوات المطلوبة

1. **Node.js** (الإصدار 18 أو أحدث)
   - تحميل من: https://nodejs.org/

2. **Bun** (مدير الحزم)
   ```bash
   # تثبيت Bun
   curl -fsSL https://bun.sh/install | bash
   # أو على Windows
   powershell -c "irm bun.sh/install.ps1 | iex"
   ```

3. **Expo CLI**
   ```bash
   npm install -g @expo/cli
   ```

4. **EAS CLI** (لبناء APK)
   ```bash
   npm install -g eas-cli
   ```

### للتطوير على الأندرويد

5. **Android Studio**
   - تحميل من: https://developer.android.com/studio
   - تثبيت Android SDK
   - إعداد متغيرات البيئة (ANDROID_HOME)

6. **Java Development Kit (JDK)**
   - الإصدار 11 أو أحدث

## التثبيت والإعداد

### 1. استنساخ المشروع

```bash
git clone <repository-url>
cd pos-system
```

### 2. تثبيت التبعيات

```bash
bun install
```

### 3. تشغيل المشروع في وضع التطوير

```bash
# تشغيل على الويب
bun start

# تشغيل على الأندرويد
bun android

# تشغيل على iOS (Mac فقط)
bun ios
```

## بناء التطبيق

### الطريقة الأولى: استخدام EAS Build (الموصى بها)

#### 1. إعداد حساب Expo

```bash
# تسجيل الدخول إلى Expo
eas login
```

#### 2. إعداد المشروع للبناء

```bash
# إنشاء ملف eas.json
eas build:configure
```

#### 3. بناء APK للأندرويد

```bash
# بناء APK للتطوير
eas build --platform android --profile development

# بناء APK للإنتاج
eas build --platform android --profile production

# بناء APK محلي (بدون رفع)
eas build --platform android --local
```

#### 4. تحميل APK

بعد اكتمال البناء، ستحصل على رابط لتحميل ملف APK.

### الطريقة الثانية: البناء المحلي

#### 1. إعداد البيئة المحلية

```bash
# تثبيت أدوات البناء المحلية
npx install-expo-modules@latest
```

#### 2. إنشاء مجلد Android

```bash
npx create-expo-app --template
```

#### 3. بناء APK محلياً

```bash
# بناء للتطوير
eas build --platform android --local --profile development

# بناء للإنتاج
eas build --platform android --local --profile production
```

## إعداد ملف eas.json

أنشئ ملف `eas.json` في جذر المشروع:

```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## إعداد app.json

تأكد من إعداد ملف `app.json` بشكل صحيح:

```json
{
  "expo": {
    "name": "نظام نقطة البيع",
    "slug": "pos-system",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "pos-system",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourcompany.possystem",
      "permissions": [
        "android.permission.INTERNET",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.READ_EXTERNAL_STORAGE"
      ]
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-sqlite"
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

## استخدام التطبيق

### تسجيل الدخول الافتراضي

- **اسم المستخدم**: admin
- **كلمة المرور**: admin

### الميزات الرئيسية

1. **نقطة البيع**: إضافة المنتجات إلى السلة وإتمام البيع
2. **إدارة المنتجات**: إضافة وتعديل وحذف المنتجات
3. **التقارير**: عرض تقارير المبيعات اليومية والشهرية
4. **الإعدادات**: تخصيص إعدادات المطعم والطباعة
5. **إدارة المستخدمين**: إضافة مستخدمين جدد وإدارة الصلاحيات

## حل المشاكل الشائعة

### مشكلة في تثبيت التبعيات

```bash
# حذف node_modules وإعادة التثبيت
rm -rf node_modules
bun install
```

### مشكلة في بناء الأندرويد

```bash
# تنظيف الكاش
eas build:cancel
eas build --platform android --clear-cache
```

### مشكلة في قاعدة البيانات

```bash
# إعادة تعيين قاعدة البيانات
# احذف التطبيق وأعد تثبيته
```

## البنية التقنية

- **Frontend**: React Native + Expo
- **Navigation**: Expo Router
- **Database**: SQLite (محلية)
- **State Management**: React Context + AsyncStorage
- **UI Components**: React Native مخصصة
- **Icons**: Lucide React Native

## المجلدات والملفات

```
pos-system/
├── app/                    # صفحات التطبيق
│   ├── (tabs)/            # صفحات التبويبات
│   ├── login.tsx          # صفحة تسجيل الدخول
│   ├── checkout.tsx       # صفحة الدفع
│   └── receipt/           # صفحات الإيصالات
├── providers/             # مزودي البيانات
│   ├── AuthProvider.tsx   # إدارة المصادقة
│   ├── DatabaseProvider.tsx # إدارة قاعدة البيانات
│   └── CartProvider.tsx   # إدارة السلة
├── components/            # المكونات المشتركة
├── assets/               # الصور والملفات
└── README.md             # هذا الملف
```

## المساهمة

1. Fork المشروع
2. أنشئ فرع للميزة الجديدة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى الفرع (`git push origin feature/AmazingFeature`)
5. افتح Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

## الدعم

إذا واجهت أي مشاكل أو لديك أسئلة، يرجى فتح issue في المستودع.

---

**ملاحظة**: تأكد من تحديث معرف الحزمة في `app.json` قبل بناء التطبيق للإنتاج.
