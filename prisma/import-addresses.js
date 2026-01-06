const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

// Parse CSV (simple parser)
function parseCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.trim().split('\n')
    const headers = lines[0].split(',')

    return lines.slice(1).map(line => {
        const values = line.split(',')
        const obj = {}
        headers.forEach((header, index) => {
            obj[header] = values[index] || null
        })
        return obj
    })
}

async function importAddressData() {
    console.log('🌍 Starting address data import...')

    try {
        // Import Thailand Data
        console.log('\n📍 Importing Thailand data...')

        // Country
        const thailandCountry = await prisma.country.upsert({
            where: { code: 'TH' },
            update: {},
            create: {
                code: 'TH',
                nameEN: 'Thailand',
                nameTH: 'ประเทศไทย',
                latitude: 13.03920744,
                longitude: 101.69982062,
            },
        })
        console.log('✅ Thailand country created')

        // Provinces (admin1)
        const admin1Path = '/tmp/tha_admin_boundaries-tha_admin1.csv'
        if (fs.existsSync(admin1Path)) {
            const provinces = parseCSV(admin1Path)
            let count = 0
            for (const prov of provinces) {
                await prisma.province.upsert({
                    where: { code: prov.adm1_pcode },
                    update: {},
                    create: {
                        code: prov.adm1_pcode,
                        nameEN: prov.adm1_name,
                        nameTH: prov.adm1_name1,
                        countryCode: 'TH',
                        latitude: parseFloat(prov.center_lat) || null,
                        longitude: parseFloat(prov.center_lon) || null,
                    },
                })
                count++
                if (count % 10 === 0) process.stdout.write(`\r   Provinces: ${count}`)
            }
            console.log(`\r✅ Imported ${count} provinces`)
        }

        // Districts (admin2)
        const admin2Path = '/tmp/tha_admin_boundaries-tha_admin2.csv'
        if (fs.existsSync(admin2Path)) {
            const districts = parseCSV(admin2Path)
            let count = 0
            for (const dist of districts) {
                await prisma.district.upsert({
                    where: { code: dist.adm2_pcode },
                    update: {},
                    create: {
                        code: dist.adm2_pcode,
                        nameEN: dist.adm2_name,
                        nameTH: dist.adm2_name1,
                        provinceCode: dist.adm1_pcode,
                        latitude: parseFloat(dist.center_lat) || null,
                        longitude: parseFloat(dist.center_lon) || null,
                    },
                })
                count++
                if (count % 50 === 0) process.stdout.write(`\r   Districts: ${count}`)
            }
            console.log(`\r✅ Imported ${count} districts`)
        }

        // Subdistricts (admin3)
        const admin3Path = '/tmp/tha_admin_boundaries-tha_admin3.csv'
        if (fs.existsSync(admin3Path)) {
            const subdistricts = parseCSV(admin3Path)
            let count = 0
            for (const subdist of subdistricts) {
                await prisma.subdistrict.upsert({
                    where: { code: subdist.adm3_pcode },
                    update: {},
                    create: {
                        code: subdist.adm3_pcode,
                        nameEN: subdist.adm3_name,
                        nameTH: subdist.adm3_name1,
                        districtCode: subdist.adm2_pcode,
                        latitude: parseFloat(subdist.center_lat) || null,
                        longitude: parseFloat(subdist.center_lon) || null,
                    },
                })
                count++
                if (count % 100 === 0) process.stdout.write(`\r   Subdistricts: ${count}`)
            }
            console.log(`\r✅ Imported ${count} subdistricts`)
        }

        // Import Laos Data
        console.log('\n📍 Importing Laos data...')

        // Country
        const laosCountry = await prisma.country.upsert({
            where: { code: 'LA' },
            update: {},
            create: {
                code: 'LA',
                nameEN: "Lao People's Democratic Republic",
                nameTH: 'สาธารณรัฐประชาธิปไตยประชาชนลาว',
                nameLO: 'ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ',
                latitude: 18.20947085,
                longitude: 104.69407219,
            },
        })
        console.log('✅ Laos country created')

        // Provinces (admin1)
        const laoAdmin1Path = '/tmp/lao_admin_boundaries-lao_admin1.csv'
        if (fs.existsSync(laoAdmin1Path)) {
            const provinces = parseCSV(laoAdmin1Path)
            let count = 0
            for (const prov of provinces) {
                await prisma.province.upsert({
                    where: { code: prov.adm1_pcode },
                    update: {},
                    create: {
                        code: prov.adm1_pcode,
                        nameEN: prov.adm1_name,
                        nameLO: prov.adm1_name1,
                        countryCode: 'LA',
                        latitude: parseFloat(prov.center_lat) || null,
                        longitude: parseFloat(prov.center_lon) || null,
                    },
                })
                count++
            }
            console.log(`✅ Imported ${count} provinces`)
        }

        // Districts (admin2)
        const laoAdmin2Path = '/tmp/lao_admin_boundaries-lao_admin2.csv'
        if (fs.existsSync(laoAdmin2Path)) {
            const districts = parseCSV(laoAdmin2Path)
            let count = 0
            for (const dist of districts) {
                await prisma.district.upsert({
                    where: { code: dist.adm2_pcode },
                    update: {},
                    create: {
                        code: dist.adm2_pcode,
                        nameEN: dist.adm2_name,
                        nameLO: dist.adm2_name1,
                        provinceCode: dist.adm1_pcode,
                        latitude: parseFloat(dist.center_lat) || null,
                        longitude: parseFloat(dist.center_lon) || null,
                    },
                })
                count++
                if (count % 20 === 0) process.stdout.write(`\r   Districts: ${count}`)
            }
            console.log(`\r✅ Imported ${count} districts`)
        }

        console.log('\n🎉 Address data import completed successfully!')
    } catch (error) {
        console.error('\n❌ Error importing address data:', error)
        throw error
    }
}

importAddressData()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
