const fs = require('fs');
const path = require('path');

const seoData = {
  'index.html': {
    title: 'Железный Дровосек — Купить металлопрокат в СПб по низким ценам | Металлобаза',
    desc: '⚡ Купить металлопрокат и металл в Санкт-Петербурге и Ленинградской области от производителя «Железный Дровосек». Продажа арматуры, труб, листов, балок. Доставка 24/7. Звоните!',
    keys: 'железный дровосек металл купить, купить металл железный дровосек, железный дровосек, металлопрокат, металл, купить металл, купить металлопрокат спб, металлобаза спб, металлургия'
  },
  'catalog.html': {
    title: 'Каталог металлопроката — Цены за метр и тонну | Железный Дровосек',
    desc: 'Полный каталог металлопроката со склада в Санкт-Петербурге. Актуальные цены на арматуру, трубы, листы, балки, швеллеры. Опт и розница, доставка.',
    keys: 'каталог металлопроката, сортамент металла, металл цены, купить арматуру спб, купить трубы стальные'
  },
  'catalog-select.html': {
    title: 'Выбор категории металлопроката — Каталог | Железный Дровосек',
    desc: 'Удобный выбор категорий металлопроката: фасонный, сортовой, листовой, трубный прокат. Быстрый переход в каталог цен.',
    keys: 'сортамент металлопроката, виды металла, арматура швеллер балка труба'
  },
  'about.html': {
    title: 'О компании «Железный Дровосек» — Надежный поставщик металлопроката в РФ',
    desc: 'Узнайте больше о компании «Железный Дровосек». Собственное производство металлообработки, логистический комплекс, 20+ лет опыта поставок металлопродукции.',
    keys: 'о компании железный дровосек, поставщик металлопроката, металлобаза санкт петербург'
  },
  'contacts.html': {
    title: 'Контакты и адреса складов в СПб | Железный Дровосек',
    desc: 'Контакты компании «Железный Дровосек» в Санкт-Петербурге. Телефоны отдела продаж, адрес склада, схема проезда, режим работы, реквизиты.',
    keys: 'контакты железный дровосек, адрес металлобазы спб, телефон отдела продаж металл'
  },
  'services.html': {
    title: 'Услуги металлообработки по ГОСТ в СПб | Железный Дровосек',
    desc: 'Профессиональная обработка металла: лазерная резка, гибка, сварка, цинкование металлопроката. Высокоточное оборудование, короткие сроки, низкие цены.',
    keys: 'услуги металлообработки, резка металла спб, гибка труб, цинкование проката'
  },
  'logistics.html': {
    title: 'Доставка металлопроката по Санкт-Петербургу и РФ | Железный Дровосек',
    desc: 'Быстрая доставка металлопроката собственным автопарком. Грузовики от 1.5 до 20 тонн. Доставка 24/7 в СПб, Ленобласть и любые регионы России.',
    keys: 'доставка металла спб, перевозка металлопроката, аренда шаланды, логистика металл'
  },
  'calculator.html': {
    title: 'Калькулятор веса металлопроката онлайн — Расчет по ГОСТ',
    desc: 'Удобный трубный и весовой калькулятор металлопроката. Онлайн-расчет веса арматуры, труб, листов, балок, швеллеров и уголков по размерам.',
    keys: 'калькулятор металлопроката, расчет веса металла, трубный калькулятор онлайн, вес арматуры метр'
  },
  'certificates.html': {
    title: 'Сертификаты соответствия и паспорта качества ГОСТ | Железный Дровосек',
    desc: 'Сертификаты соответствия и паспорта качества на всю продукцию «Железный Дровосек». Сертифицированный металлопрокат ведущих заводов России.',
    keys: 'сертификаты на металлопрокат, паспорта качества металл, гост арматура сертификат'
  },
  'news.html': {
    title: 'Новости рынка металлопроката и металлургии | Железный Дровосек',
    desc: 'Актуальные новости черной и цветной металлургии, тенденции рынка металлопроката, аналитика цен и отчеты о поставках от компании «Железный Дровосек».',
    keys: 'новости металлургии, цены на металл 2026, аналитика рынка металлопроката'
  },
  'news_trends_2026.html': {
    title: 'Тренды металлургии 2026: Цифровизация и цепочки поставок | Железный Дровосек',
    desc: 'Анализ главных трендов рынка металлопроката в 2026 году. Как цифровые платформы и автоматизация логистики меняют B2B поставки металла.',
    keys: 'тренды металлургии 2026, цифровизация поставок металла, рынок металлопроката рф'
  },
  'news_sheets_2026.html': {
    title: 'Новые поступления листового проката на склад в СПб | Железный Дровосек',
    desc: 'Расширение складской программы: поступление холоднокатаных и горячекатаных листов премиального качества. Все толщины в наличии.',
    keys: 'купить лист стальной спб, склад листов хк гк, оцинкованный лист в наличии'
  },
  'news_market_adaptation.html': {
    title: 'Адаптация рынка металлопроката к новым условиям 2026 | Железный Дровосек',
    desc: 'Как российские металлотрейдеры перестраивают логистику и ценообразование в 2026 году. Стратегии устойчивости от «Железного Дровосека».',
    keys: 'рынок металла адаптация, логистика металлопроката 2026, импортозамещение сталь'
  },
  'spravka.html': {
    title: 'Справочник снабженца: ГОСТ, размеры, таблицы веса | Железный Дровосек',
    desc: 'Технический справочник по металлопрокату. ГОСТ стандарты, таблицы теоретического веса, размеры и характеристики всех видов металлопродукции.',
    keys: 'справочник металлопроката, вес стального проката, таблицы гост металл'
  },
  'spravka_armatura.html': {
    title: 'Вес арматуры по диаметру: таблицы размеров ГОСТ | Железный Дровосек',
    desc: 'Таблицы теоретического веса 1 метра арматуры А500С, А240, А3. Размеры, площадь сечения и количество метров в тонне по ГОСТ 5781-82.',
    keys: 'вес арматуры таблица, диаметр арматуры вес, гост 5781 82 арматура'
  },
  'spravka_balka.html': {
    title: 'Размеры и вес двутавровых балок по ГОСТ | Железный Дровосек',
    desc: 'Сортамент двутавров (балок): таблицы размеров, вес погонного метра, характеристики балок Б, Ш, К по ГОСТ 26020-83 и СТО АСЧМ 20-93.',
    keys: 'вес балки двутавровой, сортамент двутавров гост, размеры балки таблица'
  },
  'spravka_shveller.html': {
    title: 'Размеры и вес стальных швеллеров по ГОСТ 8240-97 | Железный Дровосек',
    desc: 'Таблица веса и размеров стальных швеллеров серий У и П. Характеристики, площадь сечения и масса погонного метра швеллера по ГОСТ.',
    keys: 'вес швеллера таблица, гост 8240 97 швеллер, размеры швеллера'
  },
  'spravka_ugolok.html': {
    title: 'Вес стального уголка: таблицы размеров ГОСТ 8509 | Железный Дровосек',
    desc: 'Сортамент равнополочных и неравнополочных уголков. Таблицы размеров, масса 1 метра, толщина полки стального уголка по ГОСТ 8509-93.',
    keys: 'вес уголка стального, гост 8509 93 уголок равнополочный, размеры уголка таблица'
  },
  'spravka_list.html': {
    title: 'Таблица веса стального листа по толщине | Железный Дровосек',
    desc: 'Как рассчитать вес стального листа. Таблицы веса квадратного метра листового проката (г/к, х/к, оцинкованного, рифленого) по ГОСТ.',
    keys: 'вес стального листа таблица, рассчитать вес листа, гост 19903 лист'
  },
  'spravka_truba_prof.html': {
    title: 'Вес профильной трубы: таблицы размеров ГОСТ 8639 | Железный Дровосек',
    desc: 'Сортамент квадратных и прямоугольных профильных труб. Таблицы веса 1 метра, толщины стенок и размеров профильной трубы по ГОСТ.',
    keys: 'вес профильной трубы таблица, размеры проф трубы, гост 8639 труба профильная'
  },
  'spravka_truba_krug.html': {
    title: 'Размеры и вес круглых стальных труб по ГОСТ | Железный Дровосек',
    desc: 'Таблицы наружного диаметра, толщины стенок и теоретического веса круглых электросварных, водогазопроводных (ВГП) и бесшовных стальных труб.',
    keys: 'вес круглой трубы таблица, диаметр стальной трубы, гост 10704 труба электросварная'
  },
  'spravka_sort.html': {
    title: 'Справочник сортового проката: Круг, квадрат, полоса, катанка | Железный Дровосек',
    desc: 'Технические характеристики сортового проката. Таблицы размеров и веса стального круга, квадрата, полосы и катанки по ГОСТ.',
    keys: 'сортовой прокат гост, вес стального круга таблица, полоса стальная вес'
  },
  'cart.html': {
    title: 'Корзина покупателя | Железный Дровосек',
    desc: 'Ваша корзина покупок металлопроката. Оформите заказ онлайн с быстрой доставкой по Санкт-Петербургу и Ленинградской области.',
    keys: 'корзина металл, заказать металлопрокат, покупка арматуры'
  },
  'cabinet.html': {
    title: 'Личный кабинет клиента | Железный Дровосек',
    desc: 'Личный кабинет клиента компании «Железный Дровосек». Управление заказами, история покупок, статус доставки металлопроката.',
    keys: 'кабинет металлобаза, профиль клиента железный дровосек'
  },
  'product.html': {
    title: 'Карточка товара — Подробные характеристики | Железный Дровосек',
    desc: 'Характеристики, размеры, ГОСТ сертификация и цены выбранного товара из каталога металлопроката «Железный Дровосек».',
    keys: 'купить металлопрокат, характеристики металла'
  },
  'reset-password.html': {
    title: 'Восстановление пароля | Железный Дровосек',
    desc: 'Восстановление доступа к личному кабинету клиента «Железный Дровосек». Быстрый сброс пароля.',
    keys: 'восстановление пароля, сброс пароля'
  },
  'admin.html': {
    title: 'Панель управления администратора | Железный Дровосек',
    desc: 'Панель управления сайтом и базой данных металлопроката «Железный Дровосек». Управление ценами, заказами и пользователями.',
    keys: 'админ панель, управление складом'
  },
  'privacy-policy.html': {
    title: 'Политика конфиденциальности | Железный Дровосек',
    desc: 'Политика обработки персональных данных клиентов компании «Железный Дровосек». Защита личной информации.',
    keys: 'политика конфиденциальности, персональные данные'
  },
  'terms-of-service.html': {
    title: 'Условия предоставления услуг | Железный Дровосек',
    desc: 'Пользовательское соглашение и правила предоставления услуг компанией «Железный Дровосек». Правила заказа и доставки.',
    keys: 'пользовательское соглашение, договор оферты металл'
  },
  'sitemap.html': {
    title: 'Карта сайта — Все разделы и страницы | Железный Дровосек',
    desc: 'Удобная карта сайта компании «Железный Дровосек». Все разделы каталога, справочные материалы, калькулятор и контакты.',
    keys: 'карта сайта металлопрокат, структура сайта железный дровосек'
  },
  'certificate_carbon.html': {
    title: 'Сертификат качества на углеродистую сталь | Железный Дровосек',
    desc: 'Официальный сертификат качества и соответствия ГОСТ на углеродистую сталь от производителя.',
    keys: 'сертификат сталь углеродистая, гост сталь'
  },
  'certificate_eco.html': {
    title: 'Экологический сертификат соответствия | Железный Дровосек',
    desc: 'Экологический сертификат соответствия стандартам безопасности производства металлопроката.',
    keys: 'экологический сертификат, безопасность производства'
  },
  'certificate_pipes.html': {
    title: 'Сертификат качества на трубный прокат | Железный Дровосек',
    desc: 'Сертификат соответствия ГОСТ на круглые, ВГП и профильные стальные трубы.',
    keys: 'сертификат на трубы, паспорт трубного проката'
  },
  'certificate_stainless.html': {
    title: 'Сертификат на нержавеющий металлопрокат | Железный Дровосек',
    desc: 'Официальный сертификат соответствия на нержавеющую сталь и изделия из нее.',
    keys: 'сертификат нержавейка, гост нержавеющая сталь'
  },
  'certificate_view.html': {
    title: 'Просмотр сертификата соответствия | Железный Дровосек',
    desc: 'Удобный онлайн-просмотр паспортов качества и сертификатов соответствия ГОСТ.',
    keys: 'просмотр сертификата, паспорт качества'
  }
};

const defaultSeo = {
  title: 'Железный Дровосек — Качественный металлопрокат оптом и в розницу в СПб',
  desc: 'Поставщик высококачественного металлопроката со складов в Санкт-Петербурге. Арматура, трубы, листовой прокат с круглосуточной доставкой.',
  keys: 'металлопрокат, купить металл, арматура, трубы, сталь, железный дровосек'
};

// Map file name to clean logical URL
function getCleanUrl(file) {
  if (file === 'index.html') return '';
  if (file.startsWith('spravka_')) {
    const slug = file.replace('spravka_', '').replace('.html', '').replace(/_/g, '-');
    return `spravka/${slug}`;
  }
  if (file.startsWith('news_')) {
    const slug = file.replace('news_', '').replace('.html', '').replace(/_/g, '-');
    return `news/${slug}`;
  }
  if (file.startsWith('certificate_')) {
    const slug = file.replace('.html', '');
    return `certificates/${slug}`;
  }
  return file.replace('.html', '');
}

// Map file name to breadcrumb hierarchy
function getBreadcrumbs(file, pageTitle) {
  const crumbs = [
    { name: 'Главная', url: 'https://zhelezniydrovosek.ru/' }
  ];
  
  if (file === 'index.html') return null;
  
  if (file.startsWith('spravka_')) {
    crumbs.push({ name: 'Справочник', url: 'https://zhelezniydrovosek.ru/spravka' });
    let subName = pageTitle.split(':')[0].replace('Справочник', '').replace('—', '').trim();
    if (!subName) subName = 'Раздел справочника';
    crumbs.push({ name: subName, url: `https://zhelezniydrovosek.ru/${getCleanUrl(file)}` });
  } else if (file.startsWith('news_')) {
    crumbs.push({ name: 'Новости', url: 'https://zhelezniydrovosek.ru/news' });
    let subName = pageTitle.split(':')[0].replace('| Железный Дровосек', '').trim();
    crumbs.push({ name: subName, url: `https://zhelezniydrovosek.ru/${getCleanUrl(file)}` });
  } else if (file.startsWith('certificate_')) {
    crumbs.push({ name: 'Сертификаты', url: 'https://zhelezniydrovosek.ru/certificates' });
    let subName = pageTitle.replace('| Железный Дровосек', '').trim();
    crumbs.push({ name: subName, url: `https://zhelezniydrovosek.ru/${getCleanUrl(file)}` });
  } else {
    let subName = pageTitle.split('|')[0].split('—')[0].trim();
    crumbs.push({ name: subName, url: `https://zhelezniydrovosek.ru/${getCleanUrl(file)}` });
  }
  return crumbs;
}

// Find all HTML files in current directory, excluding system or temporary files
const files = fs.readdirSync(__dirname).filter(f => {
  return f.endsWith('.html') && 
         !f.startsWith('temp_') &&
         f !== 'navigation.html' &&
         f !== 'product-demo.html';
});

console.log(`Found ${files.length} HTML files to optimize...`);

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const seo = seoData[file] || defaultSeo;
  const cleanPath = getCleanUrl(file);
  const fullCanonical = `https://zhelezniydrovosek.ru/${cleanPath}`;

  // 1. Remove existing SEO meta tags and script schemas to ensure clean state
  content = content.replace(/<title>.*?<\/title>/gi, '');
  content = content.replace(/<meta\s+name=["']description["'].*?>/gi, '');
  content = content.replace(/<meta\s+name=["']keywords["'].*?>/gi, '');
  content = content.replace(/<link\s+rel=["']canonical["'].*?>/gi, '');
  content = content.replace(/<link\s+rel=["']icon["'].*?>/gi, '');
  content = content.replace(/<link\s+rel=["']apple-touch-icon["'].*?>/gi, '');
  content = content.replace(/<link\s+rel=["']mask-icon["'].*?>/gi, '');
  content = content.replace(/<meta\s+property=["']og:.*?["'].*?>/gi, '');
  content = content.replace(/<meta\s+name=["']twitter:.*?["'].*?>/gi, '');
  content = content.replace(/<meta\s+name=["']theme-color["'].*?>/gi, '');
  content = content.replace(/<meta\s+name=["']geo\..*?["'].*?>/gi, '');
  content = content.replace(/<meta\s+name=["']ICBM["'].*?>/gi, '');
  content = content.replace(/<meta\s+name=["']yandex-verification["'].*?>/gi, '');
  content = content.replace(/<meta\s+name=["']google-site-verification["'].*?>/gi, '');
  content = content.replace(/<link\s+rel=["']alternate["']\s+hreflang=.*?\/?>/gi, '');
  
  // Remove all existing Schema.org json-ld scripts to avoid duplicates
  content = content.replace(/<script\s+type=["']application\/ld\+json["']>[\s\S]*?<\/script>/gi, '');

  // 2. Build new rich SEO tags
  let verificationTags = '';
  if (file === 'index.html') {
    verificationTags = `
    <meta name="yandex-verification" content="f50f284e9eb08d81" />
    <meta name="google-site-verification" content="google-site-verification-placeholder" />`;
  }

  const seoTags = `
    <title>${seo.title}</title>
    <meta name="description" content="${seo.desc}" />
    <meta name="keywords" content="${seo.keys}" />
    <link rel="canonical" href="${fullCanonical}" />
    <link rel="alternate" hreflang="ru-RU" href="${fullCanonical}" />
    <link rel="alternate" hreflang="x-default" href="${fullCanonical}" />${verificationTags}
    
    <!-- Geo Meta Tags for regional SPb SEO -->
    <meta name="geo.region" content="RU-SPE" />
    <meta name="geo.placename" content="Санкт-Петербург" />
    <meta name="geo.position" content="59.782112;30.187957" />
    <meta name="ICBM" content="59.782112, 30.187957" />

    <!-- Open Graph tags for social sharing -->
    <meta property="og:title" content="${seo.title}" />
    <meta property="og:description" content="${seo.desc}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${fullCanonical}" />
    <meta property="og:image" content="https://zhelezniydrovosek.ru/images/logo_premium.png" />
    <meta property="og:locale" content="ru_RU" />
    <meta property="og:site_name" content="Железный Дровосек" />
    
    <!-- Twitter card tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${seo.title}" />
    <meta name="twitter:description" content="${seo.desc}" />
    <meta name="twitter:image" content="https://zhelezniydrovosek.ru/images/logo_premium.png" />
    
    <meta name="theme-color" content="#ca7093" />
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
    <link rel="icon" type="image/svg+xml" href="/images/favicon.svg?v=5" />
    <link rel="icon" type="image/png" href="/images/logo_icon.png?v=5" sizes="192x192" />
    <link rel="apple-touch-icon" href="/images/logo_icon.png?v=5" />
    <link rel="mask-icon" href="/images/favicon.svg?v=5" color="#ca7093" />
  `;

  // 3. Build Schema.org Structured Data
  let schemaJson = '';
  if (file === 'index.html') {
    schemaJson = `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": "https://zhelezniydrovosek.ru/#website",
          "url": "https://zhelezniydrovosek.ru/",
          "name": "Железный Дровосек",
          "description": "Поставщик качественного металлопроката в Санкт-Петербурге и ЛО",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://zhelezniydrovosek.ru/catalog?q={search_term_string}",
            "query-input": "required name=search_term_string"
          },
          "inLanguage": "ru"
        },
        {
          "@type": "Organization",
          "@id": "https://zhelezniydrovosek.ru/#organization",
          "name": "Железный Дровосек",
          "url": "https://zhelezniydrovosek.ru/",
          "logo": {
            "@type": "ImageObject",
            "url": "https://zhelezniydrovosek.ru/images/logo_premium.png",
            "caption": "Железный Дровосек"
          },
          "image": "https://zhelezniydrovosek.ru/images/logo_premium.png",
          "description": "Надежный поставщик качественного металлопроката и услуг металлообработки по ГОСТ в СПб.",
          "telephone": "+7 (812) 982-53-20",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Южная часть промзоны Горелово, 2-й квартал, 30",
            "addressLocality": "Виллозское городское поселение",
            "addressRegion": "Ленинградская область",
            "postalCode": "188508",
            "addressCountry": "RU"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+7 (812) 982-53-20",
            "contactType": "sales",
            "areaServed": "RU",
            "availableLanguage": "Russian"
          }
        },
        {
          "@type": "SiteNavigationElement",
          "@id": "https://zhelezniydrovosek.ru/#navigation",
          "name": [
            "Каталог",
            "О компании",
            "Услуги",
            "Контакты",
            "Калькулятор",
            "Сертификаты",
            "Новости",
            "Справочник"
          ],
          "url": [
            "https://zhelezniydrovosek.ru/catalog-select",
            "https://zhelezniydrovosek.ru/about",
            "https://zhelezniydrovosek.ru/services",
            "https://zhelezniydrovosek.ru/contacts",
            "https://zhelezniydrovosek.ru/calculator",
            "https://zhelezniydrovosek.ru/certificates",
            "https://zhelezniydrovosek.ru/news",
            "https://zhelezniydrovosek.ru/spravka"
          ]
        }
      ]
    }
    </script>`;
  } else {
    const breadcrumbs = getBreadcrumbs(file, seo.title);
    if (breadcrumbs) {
      const items = breadcrumbs.map((crumb, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "name": crumb.name,
        "item": crumb.url
      }));
      schemaJson = `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": ${JSON.stringify(items, null, 2)}
    }
    </script>`;
    }
  }

  // 4. Convert all data-alt to alt attributes for search engines to index images
  content = content.replace(/data-alt=/g, 'alt=');

  // 5. Inject tags right after <meta charset="utf-8"/> or inside <head>
  const totalInjections = seoTags + schemaJson;
  if (content.includes('<meta charset="utf-8"/>')) {
    content = content.replace('<meta charset="utf-8"/>', '<meta charset="utf-8"/>' + totalInjections);
  } else if (content.includes('<meta charset="utf-8" />')) {
    content = content.replace('<meta charset="utf-8" />', '<meta charset="utf-8" />' + totalInjections);
  } else if (content.includes('<head>')) {
    content = content.replace('<head>', '<head><meta charset="utf-8"/>' + totalInjections);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Optimized SEO for ${file}`);
});

// Generate Robots.txt (Optimized for Yandex and Google bots)
const robotsTxt = `User-agent: Yandex
Allow: /
Disallow: /admin
Disallow: /cabinet
Disallow: /cart
Disallow: /reset-password
Disallow: /api/
Host: https://zhelezniydrovosek.ru

User-agent: *
Allow: /
Disallow: /admin
Disallow: /cabinet
Disallow: /cart
Disallow: /reset-password
Disallow: /api/

Sitemap: https://zhelezniydrovosek.ru/sitemap.xml
`;
fs.writeFileSync(path.join(__dirname, 'robots.txt'), robotsTxt, 'utf8');
console.log('✓ Generated robots.txt');

// Generate sitemap.xml dynamically from our actual files list
let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

files.forEach(file => {
  const cleanPath = getCleanUrl(file);
  const loc = `https://zhelezniydrovosek.ru/${cleanPath}`;
  
  let priority = '0.8';
  let changefreq = 'weekly';
  
  if (file === 'index.html') {
    priority = '1.0';
    changefreq = 'daily';
  } else if (file === 'catalog.html' || file === 'catalog-select.html') {
    priority = '0.9';
    changefreq = 'daily';
  } else if (file.startsWith('spravka_') || file.startsWith('news_')) {
    priority = '0.7';
    changefreq = 'monthly';
  } else if (file.startsWith('certificate_') || file === 'privacy-policy.html' || file === 'terms-of-service.html') {
    priority = '0.4';
    changefreq = 'monthly';
  }

  sitemapXml += `  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
`;
});

sitemapXml += `</urlset>`;
fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemapXml, 'utf8');
console.log('✓ Generated sitemap.xml');

console.log('--- All SEO optimizations completed! ---');
