// =====================================================
// SEO Schema Helpers for V-Group Landing Page
// JSON-LD structured data for Google/AI parsing
// =====================================================

/**
 * Organization Schema - V-Group company info
 */
export function getOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'V-GROUP',
        alternateName: ['V-Group', 'วี-กรุ๊ป', 'ວີ-ກຣຸບ'],
        description: 'Thailand\'s #1 AI-Driven Lao Workforce Solutions Provider',
        url: 'https://v-group.la',
        logo: 'https://v-group.la/logo.png',
        image: 'https://v-group.la/og-image.jpg',
        foundingDate: '2015',
        numberOfEmployees: {
            '@type': 'QuantitativeValue',
            minValue: 50,
            maxValue: 100
        },
        areaServed: [
            { '@type': 'Country', name: 'Thailand' },
            { '@type': 'Country', name: 'Laos' }
        ],
        serviceArea: {
            '@type': 'GeoCircle',
            geoMidpoint: {
                '@type': 'GeoCoordinates',
                latitude: 13.7563,
                longitude: 100.5018
            },
            geoRadius: '500 km'
        },
        contactPoint: [
            {
                '@type': 'ContactPoint',
                telephone: '+66-2-123-4567',
                contactType: 'customer service',
                availableLanguage: ['Thai', 'Lao', 'English'],
                areaServed: 'TH'
            },
            {
                '@type': 'ContactPoint',
                telephone: '+856-21-555-1234',
                contactType: 'customer service',
                availableLanguage: ['Lao', 'Thai'],
                areaServed: 'LA'
            }
        ],
        address: [
            {
                '@type': 'PostalAddress',
                addressCountry: 'TH',
                addressLocality: 'Bangkok',
                streetAddress: '123 Sukhumvit Road'
            },
            {
                '@type': 'PostalAddress',
                addressCountry: 'LA',
                addressLocality: 'Vientiane',
                streetAddress: 'Phonesavanh Village'
            }
        ],
        sameAs: [
            'https://www.facebook.com/vgroup.la',
            'https://line.me/ti/p/@vgroup'
        ]
    }
}

/**
 * FAQ Schema - Common questions for AEO
 */
export function getFAQSchema(faqs: { question: string; answer: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer
            }
        }))
    }
}

/**
 * Service Schema - V-Work, V-Care, V-Connect
 */
export function getServiceSchema(service: {
    name: string
    description: string
    provider?: string
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.name,
        description: service.description,
        provider: {
            '@type': 'Organization',
            name: service.provider || 'V-GROUP'
        },
        areaServed: {
            '@type': 'Country',
            name: 'Thailand'
        }
    }
}

/**
 * BreadcrumbList Schema
 */
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url
        }))
    }
}

/**
 * Article Schema - for blog posts
 */
export function getArticleSchema(article: {
    title: string
    description: string
    url: string
    image: string
    datePublished: string
    dateModified?: string
    author: string
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.description,
        url: article.url,
        image: article.image,
        datePublished: article.datePublished,
        dateModified: article.dateModified || article.datePublished,
        author: {
            '@type': 'Organization',
            name: article.author || 'V-GROUP'
        },
        publisher: {
            '@type': 'Organization',
            name: 'V-GROUP',
            logo: {
                '@type': 'ImageObject',
                url: 'https://v-group.la/logo.png'
            }
        }
    }
}

/**
 * LocalBusiness Schema - for map/location
 */
export function getLocalBusinessSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'EmploymentAgency',
        name: 'V-GROUP Thailand',
        description: 'AI-Driven Lao Workforce Solutions',
        url: 'https://v-group.la',
        telephone: '+66-2-123-4567',
        email: 'contact@v-group.la',
        address: {
            '@type': 'PostalAddress',
            streetAddress: '123 Sukhumvit Road',
            addressLocality: 'Bangkok',
            postalCode: '10110',
            addressCountry: 'TH'
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: 13.7563,
            longitude: 100.5018
        },
        openingHoursSpecification: [
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                opens: '08:30',
                closes: '17:30'
            }
        ],
        priceRange: '฿฿฿'
    }
}

// Default FAQ data for V-Group
export const DEFAULT_FAQS = {
    th: [
        {
            question: 'นำเข้าแรงงานลาวใช้เวลากี่วัน?',
            answer: 'ระยะเวลาปกติ 30-45 วัน ขึ้นอยู่กับจำนวนแรงงานและความพร้อมของเอกสาร ด้วยระบบ AI ของ V-GROUP เราสามารถลดเวลาได้ถึง 20% เมื่อเทียบกับกระบวนการปกติ'
        },
        {
            question: 'ค่าใช้จ่ายในการนำเข้าแรงงาน MOU เท่าไหร่?',
            answer: 'ค่าใช้จ่ายเริ่มต้นประมาณ 15,000-25,000 บาท/คน ขึ้นอยู่กับประเภทงานและระยะเวลาสัญญา สามารถใช้เครื่องคำนวณบนเว็บไซต์เพื่อประเมินงบประมาณเบื้องต้น'
        },
        {
            question: 'ต้องเตรียมเอกสารอะไรบ้างสำหรับนายจ้าง?',
            answer: 'เอกสารหลักได้แก่: หนังสือรับรองบริษัท, ทะเบียนการค้า, หนังสือมอบอำนาจ, แบบแจ้งความต้องการแรงงานต่างด้าว (Demand Letter) และเอกสารอื่นๆ ตามที่กรมการจัดหางานกำหนด'
        },
        {
            question: 'V-GROUP รับประกันอะไรบ้าง?',
            answer: 'เรารับประกันความพึงพอใจ 90 วัน - หากแรงงานไม่ตรงตามที่ระบุ เราจะจัดหาทดแทนให้ฟรี นอกจากนี้ยังมีระบบ AI Safety Monitoring ที่ช่วยป้องกันปัญหาก่อนเกิดขึ้น'
        },
        {
            question: 'พื้นที่ให้บริการครอบคลุมที่ไหนบ้าง?',
            answer: 'V-GROUP ให้บริการครอบคลุมทั่วประเทศไทย โดยเฉพาะนิคมอุตสาหกรรมหลักๆ ได้แก่ อมตะซิตี้, นิคมฯ โรจนะ, นิคมฯ บางปู, พื้นที่ EEC และนิคมอื่นๆ อีกกว่า 20 แห่ง'
        },
        {
            question: 'ติดต่อ V-GROUP ได้อย่างไร?',
            answer: 'สามารถติดต่อได้หลายช่องทาง: โทร 02-123-4567 (ไทย), +856 21 555 1234 (ลาว), LINE: @vgroup, หรือกรอกแบบฟอร์มบนเว็บไซต์ เรายินดีให้คำปรึกษาฟรี 24 ชั่วโมง'
        }
    ],
    la: [
        {
            question: 'ການນຳເຂົ້ານາງານລາວໃຊ້ເວລາເທົ່າໃດ?',
            answer: 'ໄລຍະເວລາປົກກະຕິ 30-45 ວັນ ຂຶ້ນກັບຈຳນວນແຮງານ ແລະ ຄວາມພ້ອມຂອງເອກະສານ'
        },
        {
            question: 'ຄ່າໃຊ້ຈ່າຍໃນການນຳເຂົ້າແຮງງານ MOU ເທົ່າໃດ?',
            answer: 'ຄ່າໃຊ້ຈ່າຍເລີ່ມຕົ້ນປະມານ 15,000-25,000 ບາດ/ຄົນ'
        }
    ]
}
