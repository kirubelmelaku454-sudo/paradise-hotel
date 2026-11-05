import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../context/LanguageContext';
import LuxuryLogo from './LuxuryLogo';
import AIModelSwitcher, { AI_MODELS } from './AIModelSwitcher';
import API from '../../api';

// Multilingual Knowledge Base for 24/7 AI Concierge (Instant Offline Fallback)
const KNOWLEDGE_BASE = [
    {
        id: 'rooms',
        keywords: [
            'room', 'suite', 'deluxe', 'booking', 'reserve', 'bed', 'sleep', 'stay', 'rates',
            'ክፍል', 'ክፍሎች', 'አልጋ', 'ማረፊያ', 'ስዊት', 'ማስያዣ', 'ማስያዝ',
            'kutaa', 'kutaalee', 'siree', 'qabachuu', 'ciisicha',
            'ክፍሊ', 'ክፍልታት', 'ዓራት', 'ምትሓዝ', 'ምሕዛዝ'
        ],
        answers: {
            en: '👑 **Paradise Luxury Suites**: We offer Executive Deluxe Suites, Superior King Rooms, and Presidential VIP Quarters. Every room features panoramic city terrace views, king-size orthopedic beds, Italian marble en-suite bathrooms, high-speed WiFi, 24/7 room service, and paperless National ID check-in. You can browse and select suites directly on the Reserve Room page!',
            am: '👑 **የፓራዳይስ የቅንጦት ክፍሎች**፦ ኤክስኪዩቲቭ ዲሉክስ፣ ሱፔሪየር ኪንግ እና ፕሬዝዳንታዊ ቪ.አይ.ፒ ክፍሎችን አዘጋጅተናል። እያንዳንዱ ክፍል ውብ የደብረ ማርቆስ እይታ፣ ምቹ አልጋዎች፣ የውስጥ መታጠቢያ፣ ፈጣን ዋይፋይ፣ የ24 ሰዓት የክፍል መስተንግዶ እና በብሔራዊ መታወቂያ ፈጣን ምዝገባ አለው። አሁኑኑ በ"ክፍል ያስይዙ" ገጽ ላይ ገብተው መምረጥ ይችላሉ!',
            om: '👑 **Kutaalee Qananii Paaraadaayis**: Kutaalee Executive Deluxe, Superior King fi Presidential VIP qopheessineerra. Kutaaleen hundi ilaallata gaarii, siree mijataa, mana dhiqannaa ammayyaa, interneetii saffisaa fi tajaajila sa\'aatii 24 qabu. Fuula "Kutaa Qabadhaa" jedhu irraa filachuu dandeessu!',
            ti: '👑 **ምጡቓት ክፍልታት ፓራዳይስ**፦ ኤክስኪዩቲቭ ዲሉክስ፣ ሱፔሪየር ኪንግን ፕረዚደንታዊ ቪ.አይ.ፒን ክፍልታት ኣለዉና። ኩሎም ክፍልታት ጽቡቕ ናይ ደብረ ማርቆስ ትርኢት፣ ምቹእ ዓራውቲ፣ ናይ ውሽጢ ሽቓቕ፣ ቅልጡፍ ዋይፋይን ናይ 24 ሰዓት ኣገልግሎትን ዘጠቓልሉ እዮም። ኣብቲ "ክፍሊ ሓዙ" ዝብል ገጽ ብምእታው ክትመርጹ ትኽእሉ ኢኹም!'
        }
    },
    {
        id: 'fayda',
        keywords: [
            'id', 'fayda', 'national id', 'card', 'scan', 'camera', 'pin', 'fan', 'contactless', 'paperless',
            'መታወቂያ', 'ፋይዳ', 'ካርድ', 'ካሜራ', 'ፒን', 'ስካን', 'ብሔራዊ',
            'waraqaa eenyummaa', 'eenyummaa', 'sakatta\'uu',
            'መለለዪ', 'ወረቐት', 'ፋይዳ'
        ],
        answers: {
            en: '🪪 **Contactless National ID (Fayda) Verification**: Paradise Hotel uses an advanced automatic camera verification system for Ethiopian National ID (Fayda). Hold your card steady in front of your camera to scan front and back, enter your PIN/FAN, and your check-in profile is verified in seconds — 100% paperless!',
            am: '🪪 **ዘመናዊ የብሔራዊ መታወቂያ (ፋይዳ) ስካነር**፦ ፓራዳይስ ሆቴል በኢትዮጵያ የመጀመሪያውን ዘመናዊ የካሜራ መታወቂያ መመርመሪያ ይጠቀማል። የብሔራዊ መታወቂያዎን የፊትና የጀርባ ገጽ በካሜራ በማሳየት እና የእርስዎን የፋይዳ PIN/FAN ቁጥር በማስገባት በሰከንዶች ውስጥ ያለምንም ወረቀት ምዝገባዎን ያጠናቅቃሉ!',
            om: '🪪 **Waraqaa Eenyummaa Biyyooleessaa (Faayidaa)**: Hoteelli Paaraadaayis sirna kaameraa ammayyaatiin waraqaa eenyummaa duraa fi duubaan sakatta\'ee daqiiqaa muraasa keessatti mirkaneessa. Lakkoofsa PIN/FAN keessan galchuudhaan waraqaa malee galmee xumurtu!',
            ti: '🪪 **ናይ ብሄራዊ መለለዪ ወረቐት (ፋይዳ) ስካነር**፦ ፓራዳይስ ሆቴል ብዘመናዊ ካሜራ ኣቢሉ ናይ ብሄራዊ መታወቂያኹም ቅድሚትን ድሕሪትን ብምምርማርን ናይ ፋይዳ PIN/FAN ቁጽሪ ብምእታውን ብዘይ ወረቐት ኣብ ካልኢታት ምዝገባኹም የረጋግጽ!'
        }
    },
    {
        id: 'food',
        keywords: [
            'food', 'dining', 'restaurant', 'breakfast', 'dinner', 'lunch', 'menu', 'eat', 'drink', 'beverage', 'coffee', 'doro', 'kitfo', 'pizza', 'steak', 'burger',
            'ምግብ', 'ምግቦች', 'መጠጥ', 'ቁርስ', 'ምሳ', 'እራት', 'ዶሮ', 'ክትፎ', 'ስጋ', 'ቡና', 'ሜኑ', 'ፒዛ', 'በርገር',
            'nyaata', 'dhugaatii', 'laaqana', 'irbaata', 'buna', 'lukkuu', 'kitfoo', 'meeniyuu',
            'ምግቢ', 'ምግብታት', 'መስተ', 'ቁርሲ', 'ምሳሕ', 'ድራር', 'ደርሆ', 'ክትፎ', 'ቡን', 'ሜኑ'
        ],
        answers: {
            en: '🍕 **Gourmet Dining & 24/7 Room Delivery**: Savor authentic Ethiopian culinary classics (Special Kitfo, Doro Wat, Agelgil, Beyaynetu, Tibs) alongside wood-fired pizza, tender dry-aged steaks, fresh burgers, cocktails, and traditional Jebena Buna coffee. You can order food for your room, your reserved table, or takeaway directly via our Order Food page!',
            am: '🍕 **ባህላዊ እና ዘመናዊ ምግቦች (24/7)**፦ ልዩ ክትፎ፣ የዶሮ ወጥ፣ አገልግል፣ በያይነቱ፣ ጥብስ እንዲሁም ፒዛ፣ ስቴክ፣ በርገር፣ ትኩስ ጁስ እና የጀበና ቡና ተዘጋጅቷል። ለክፍልዎ፣ ለተያዘው ጠረጴዛዎ ወይም ለይዞ መሄድ (Takeaway) በ"ምግብ ይዘዙ" ገጽ ላይ በቀላሉ ማዘዝ ይችላሉ!',
            om: '🍕 **Nyaata Aadaa fi Ammayyaa (24/7)**: Kitfoo addaa, wotii lukkuu, bayaynatuu, xibsoo, akkasumas piizaa, isteeckii, bargaarii, cuunfaa fi buna jabanaa argattu. Kutaa keessaniif ykn minjaala qabattaniif fuula "Nyaata Ajajaa" jedhu irraa ajajuu dandeessu!',
            ti: '🍕 **ባህላውን ዘመናውን ምግብታት (24/7)**፦ ፍሉይ ክትፎ፣ ጸብሒ ደርሆ፣ በያይነቱ፣ ጥብሲ ከምኡ’ውን ፒዛ፣ ስቴክ፣ በርገር፣ ጽማቝ ፍረታትን ባህላዊ ጀበና ቡንን ተዳሊዩ ኣሎ። ንክፍልኹም ወይ ንዝተታሕዘ ጣውላኹም ካብቲ "ምግቢ እዘዙ" ዝብል ገጽ ብቐሊሉ ክትእዝዙ ትኽእሉ ኢኹም!'
        }
    },
    {
        id: 'desk',
        keywords: [
            'desk', 'table', 'coworking', 'co-working', 'work', 'laptop', 'free with food', 'meeting', 'terrace',
            'ጠረጴዛ', 'ጠረጴዛዎች', 'ሥራ', 'ስራ', 'ላፕቶፕ', 'ነጻ', 'ስብሰባ', 'ቴራስ',
            'minjaala', 'hojii', 'bilisa', 'walga\'ii',
            'ጣውላ', 'ጣውላታት', 'ስራሕ', 'ነጻ', 'ኣኼባ'
        ],
        answers: {
            en: '🍽️ **Executive Desks & Free Table Offer**: We feature dedicated dining tables and co-working desks on our panoramic terrace and VIP lounge with dedicated power outlets and high-speed fiber internet. **Special Privilege**: Check "Pair with Food Order" and your table reservation fee is **100% FREE**! Visit the Reserve Desk page to choose your table.',
            am: '🍽️ **የመመገቢያ እና የሥራ ጠረጴዛዎች (ልዩ ስጦታ)**፦ በውብ ቴራስ እና በቪ.አይ.ፒ ላውንጅ ውስጥ የኤሌክትሪክ ሶኬት እና ፈጣን ኢንተርኔት ያላቸው ጠረጴዛዎች አዘጋጅተናል። **ልዩ እድል**፦ ምግብ አብረው ሲያዙ የጠረጴዛው ማስያዣ ክፍያ **100% ነጻ (FREE)** ይሆናል! በ"ጠረጴዛ ያስይዙ" ገጽ ላይ መርጠው ያስይዙ።',
            om: '🍽️ **Minjaala Hojii fi Nyaataa (Carraa Addaa)**: Minjaala ammayyaa interneetii saffisaa fi korontoo qabu qopheessineerra. **Carraa Guddaa**: Nyaata yoo ajajjan gatiin minjaalaa **100% Bilisa** ta\'a! Fuula "Minjaala Qabadhaa" irraa filadhaa.',
            ti: '🍽️ **ናይ ስራሕን መግብን ጣውላታት (ፍሉይ ዕድል)**፦ ኣብ ጽቡቕ ቴራስን ቪ.አይ.ፒ ላውንጅን ናይ ኤሌክትሪክ ሶኬትን ቅልጡፍ ኢንተርኔትን ዘለዎም ጣውላታት ኣለዉና። **ፍሉይ ዕድል**፦ ምግቢ እንተኣዚዝኩም ናይ ጣውላ ምትሓዝ ክፍሊትኩም **100% ብነጻ** ይኸውን! ኣብቲ "ጣውላ ሓዙ" ዝብል ገጽ መሪጽኩም ሓዙ።'
        }
    },
    {
        id: 'times',
        keywords: [
            'check in', 'check out', 'checkin', 'checkout', 'time', 'hours', 'arrive', 'leave', 'early', 'late',
            'ሰዓት', 'መግቢያ', 'መውጫ', 'መቼ', 'ቀትር',
            'yeroo', 'seensa', 'ba\'insa', 'sa\'aatii',
            'ሰዓት', 'ምእታው', 'ምውጻእ'
        ],
        answers: {
            en: '⏰ **Check-In & Check-Out Hours**: Standard guest check-in begins at **2:00 PM (14:00)** and check-out is by **12:00 PM (noon)**. If you need early arrival, late check-out, or secure luggage storage, please message our 24/7 Front Desk or request it during booking.',
            am: '⏰ **የመግቢያና የመውጫ ሰዓት**፦ መደበኛ የእንግዶች መግቢያ (Check-in) ከቀኑ **8:00 ሰዓት (2:00 PM)** ጀምሮ ሲሆን፣ መውጫ (Check-out) ደግሞ በዕለቱ ቀትር **6:00 ሰዓት (12:00 PM)** ነው። ቀድመው ለመግባት፣ አርፍደው ለመውጣት ወይም ሻንጣ ለማስቀመጥ ለሪሴፕሽን ማሳወቅ ይችላሉ።',
            om: '⏰ **Sa\'aatii Seensaa fi Ba\'insaa**: Seensi keessummootaa sa\'aatii **8:00 (2:00 PM)** irraa jalqaba; ba\'insi immoo sa\'aatii **6:00 (12:00 PM)** ta\'a. Sa\'aatii duratti seenuuf ykn boodatti ba\'uuf kawaan keenya beeksisuu dandeessu.',
            ti: '⏰ **ናይ ምእታውን ምውጻእን ሰዓት**፦ ስሩዕ ናይ ኣጋይሽ ምእታው (Check-in) ካብ ቀትሪ **8:00 ሰዓት (2:00 PM)** ክኸውን ከሎ፣ ምውጻእ (Check-out) ድማ ቀትሪ **6:00 ሰዓት (12:00 PM)** እዩ። ቀዲምኩም ንምእታው ወይ ጸንሒትኩም ንምውጻእ ንሪሴፕሽን ክትሕብሩ ትኽእሉ ኢኹም።'
        }
    },
    {
        id: 'payment',
        keywords: [
            'price', 'rate', 'cost', 'currency', 'dollar', 'birr', 'etb', 'usd', 'payment', 'telebirr', 'chapa', 'card', 'cbe', 'cash',
            'ዋጋ', 'ብር', 'ዶላር', 'ክፍያ', 'ቴሌብር', 'ካርድ', 'ባንክ', 'ጥሬ ገንዘብ',
            'gatii', 'kaffaltii', 'birrii', 'doolaara', 'baankii',
            'ዋጋ', 'ብር', 'ዶላር', 'ክፍሊት', 'ቴሌብር', 'ባንኪ'
        ],
        answers: {
            en: '💵 **Currencies & Flexible Payments**: We proudly support dual currencies: **Ethiopian Birr (ETB)** and **US Dollars (USD)**! You can toggle between ETB and USD anytime via the currency button in the topbar. We accept Telebirr, CBE Birr, Chapa, Visa/Mastercard, and direct bank transfers.',
            am: '💵 **ክፍያ እና ገንዘብ (ETB & USD)**፦ ሆቴላችን ሁለቱንም ገንዘቦች ይደግፋል፡ **የኢትዮጵያ ብር (ETB)** እና **የአሜሪካ ዶላር (USD)**! በላይኛው አሞሌ ላይ ባለው አዝራር ዋጋውን በብር ወይም በዶላር መቀየር ይችላሉ። ክፍያ በቴሌብር፣ በሲቢኢ ብር፣ በካርድ፣ በቻፓ ወይም በጥሬ ገንዘብ መፈጸም ይቻላል።',
            om: '💵 **Gatii fi Kaffaltii (ETB & USD)**: Hoteelli keenya **Birrii Itoophiyaa (ETB)** fi **Doolaara Ameerikaa (USD)** ni fudhata! Gatii kaffaltii Telebirr, CBE Birr, Chapa fi kaardiin kaffaluu dandeessu.',
            ti: '💵 **ክፍሊትን ባጤራን (ETB & USD)**፦ ሆቴልና ክልቲኦም ባጤራታት ይቕበል እዩ፡ **ናይ ኢትዮጵያ ብር (ETB)** ከምኡ’ውን **ናይ ኣሜሪካ ዶላር (USD)**! ኣብቲ ላዕለዋይ ባር ዘሎ መቐየሪ ብምጥቃም ዋጋ ብብር ወይ ብዶላር ክትርእዩ ትኽእሉ ኢኹም። ብቴሌብር፣ ብባንኪ ወይ ብካርድ ምኽፋል ይከኣል እዩ።'
        }
    },
    {
        id: 'location',
        keywords: [
            'location', 'where', 'address', 'debre markos', 'place', 'map', 'directions', 'drive', 'airport',
            'የት', 'አድራሻ', 'ደብረ ማርቆስ', 'ቦታ', 'መገኛ', 'ካርታ',
            'bakka', 'teessoo', 'dabra maarqoos', 'kallattii',
            'ኣበይ', 'ኣድራሻ', 'ደብረ ማርቆስ', 'ቦታ'
        ],
        answers: {
            en: '📍 **Prime Location in Debre Markos**: Paradise Hotel is centrally situated in Debre Markos, Amhara Region, Ethiopia (Plus Code: **8PQJ+4F2**). We offer panoramic highland views, complimentary 24/7 guarded parking, and concierge shuttle assistance.',
            am: '📍 **የፓራዳይስ ሆቴል አድራሻ**፦ ሆቴላችን የሚገኘው በደብረ ማርቆስ ከተማ ማእከል፣ አማራ ክልል፣ ኢትዮጵያ ውስጥ ነው። ምቹ የመኪና ማቆሚያ፣ ጸጥ ያለ እና ውብ የከተማዋ እይታ አለው።',
            om: '📍 **Bakka Hoteela Paaraadaayis**: Hoteelli keenya Magaalaa Dabra Maarqoos, Naannoo Amaaraa, Itoophiyaa keessatti argama. Iddoo baay\'ee mijataa, bakka paarkingii qulqulluu fi amansiisaa qaba.',
            ti: '📍 **ኣድራሻ ፓራዳይስ ሆቴል**፦ ሆቴልና ኣብ ማእከል ከተማ ደብረ ማርቆስ፣ ክልል ኣምሓራ፣ ኢትዮጵያ ይርከብ። ውሑስ ናይ ማኪና ደው መበሊ፣ ሰላማውን ጽቡቕ ናይ ከተማ ትርኢትን ዘለዎ እዩ።'
        }
    },
    {
        id: 'wifi',
        keywords: [
            'wifi', 'internet', 'wireless', 'speed', 'fiber', 'password', 'network',
            'ዋይፋይ', 'ኢንተርኔት', 'ኔትወርክ', 'ፓስወርድ', 'ፍጥነት',
            'interneetii', 'saffisa', 'mallattoo',
            'ዋይፋይ', 'ኢንተርኔት', 'ቅልጣፈ'
        ],
        answers: {
            en: '📶 **High-Speed Fiber WiFi**: Complimentary gigabit fiber internet covers all suites, executive desks, gardens, and dining halls. Network: **ParadiseHotel_Guest** (Instant seamless connection; no complex password required).',
            am: '📶 **ፈጣን የፋይበር ዋይፋይ (WiFi)**፦ በሁሉም ክፍሎች፣ በሥራ ጠረጴዛዎች እና በመመገቢያ አዳራሽ ውስጥ ከፍተኛ ፍጥነት ያለው ነጻ የፋይበር ኢንተርኔት ይገኛል። ኔትወርክ ስም፡ **ParadiseHotel_Guest** (ምንም ውስብስብ ፓስወርድ አይጠይቅም)!',
            om: '📶 **Interneetii Saffisaa (WiFi)**: Kutaalee hunda, minjaala hojii fi bakka nyaataa keessatti interneetiin saffisaa bilisaan jira. Maqaa Neetwoorkii: **ParadiseHotel_Guest**!',
            ti: '📶 **ቅልጡፍ ናይ ፋይበር ዋይፋይ (WiFi)**፦ ኣብ ኩሎም ክፍልታት፣ ናይ ስራሕ ጣውላታትን መመገቢ ኣዳራሽን ብነጻ ዝወሃብ ቅልጡፍ ናይ ኢንተርኔት ኣገልግሎት ኣሎ። መለለዪ ሽም፡ **ParadiseHotel_Guest**!'
        }
    },
    {
        id: 'contact',
        keywords: [
            'contact', 'phone', 'call', 'reception', 'email', 'number', 'manager', 'receptionist', 'staff', 'inquiry', 'message',
            'ስልክ', 'ደውል', 'ሪሴፕሽን', 'ኢሜይል', 'ያግኙን', 'ማኔጀር', 'ሰራተኛ', 'ጥያቄ',
            'bilbila', 'kawaan', 'qunnamaa', 'teessoo', 'ergaa',
            'ተሌፎን', 'ደውሉ', 'ሪሴፕሽን', 'ርኸቡና', 'መልእኽቲ'
        ],
        answers: {
            en: '📞 **24/7 Front Desk & Concierge Contact**: Reach our team directly by phone at **+251 58 771 1234** or email **reception@paradisehotel.com**. You can also submit an inquiry on our Contact Us page, and our staff will reply directly to your dashboard in real-time!',
            am: '📞 **የ24 ሰዓት የሪሴፕሽን ስልክና አድራሻ**፦ በስልክ ቁጥር **+251 58 771 1234** ወይም በኢሜይል **reception@paradisehotel.com** ደውለው ያግኙን። እንዲሁም በ"ያግኙን (Contact Us)" ገጽ ላይ መልዕክት በመላክ ፈጣን ቀጥተኛ ምላሽ ማግኘት ይችላሉ!',
            om: '📞 **Qunnamsiisa Sa\'aatii 24**: Lakkoofsa bilbilaa **+251 58 771 1234** ykn imeeyilii **reception@paradisehotel.com** fayyadamuun nu qunnamaa. Fuula "Nu Qunnamaa" jedhu irraas ergaa erguun deebii hatattamaa argattu!',
            ti: '📞 **ናይ 24 ሰዓት ሪሴፕሽን ተሌፎን**፦ ብቁጽሪ ተሌፎን **+251 58 771 1234** ወይ ብኢመይል **reception@paradisehotel.com** ደዊልኩም ርኸቡና። ከምኡ’ውን ኣብቲ "ርኸቡና" ዝብል ገጽ መልእኽቲ ብምልኣኽ ቀጥታዊ መልሲ ክትረኽቡ ትኽእሉ ኢኹም!'
        }
    },
    {
        id: 'discounts',
        keywords: [
            'discount', 'offer', 'promo', 'deal', 'cheap', 'special', 'coupon',
            'ቅናሽ', 'ልዩ ቅናሽ', 'ቅናሾች', 'እድል', 'ኮድ',
            'gatii hir\'ate', 'hir\'ina', 'carraa',
            'ፍሉይ ቅናሽ', 'ቅናሽ'
        ],
        answers: {
            en: '🏷️ **Special Offers & Discounts**: We currently offer up to 20% seasonal discounts on selected Executive Suites and gourmet dining specials! Also, booking a table with food waives your table reservation fee 100%. Visit the Discounts page to view all live promotions!',
            am: '🏷️ **ልዩ ቅናሾች**፦ በተመረጡ ክፍሎች እና ምግቦች ላይ እስከ 20% የሚደርስ ልዩ ቅናሽ አለን! በተጨማሪም ምግብ አብረው ሲያዙ የጠረጴዛ ማስያዣው 100% ነጻ ነው የሚሆነው። "ልዩ ቅናሾች" ገጽ ላይ ገብተው ዝርዝሩን ይመልከቱ!',
            om: '🏷️ **Gatii Hir\'ate**: Kutaalee fi nyaata filataman irratti hanga 20% gatiin hir\'ateera! Akkasumas nyaata wajjin minjaalli 100% bilisa. Fuula "Gatii Hir\'ate" jedhu daawwadhaa!',
            ti: '🏷️ **ፍሉይ ቅናሽ**፦ ኣብ ዝተመርጹ ክፍልታትን ምግብታትን ክሳብ 20% ዝበጽሕ ፍሉይ ቅናሽ ኣሎና! ከምኡ’ውን ምስ ምግቢ ዝተሓዘ ጣውላ 100% ብነጻ እዩ። ኣብቲ "ፍሉይ ቅናሽ" ዝብል ገጽ ርኣዩ!'
        }
    },
    {
        id: 'greeting',
        keywords: [
            'hello', 'hi', 'hey', 'greetings', 'morning', 'evening', 'good',
            'ሰላም', 'እንዴት ነህ', 'እንዴት ነሽ', 'ጤና ይስጥልኝ', 'እንደምን',
            'akkam', 'nagaa', 'akkamta', 'fayyaa',
            'ሰላም', 'ከመይ', 'ደሓንዶ'
        ],
        answers: {
            en: 'Greetings! ✨ Welcome to Paradise Hotel Debre Markos. I am your 24/7 AI Concierge. I can help you with room reservations, table bookings, food menus, contactless Fayda ID check-in, pricing, and directions. What would you like to explore today?',
            am: 'ሰላም! ✨ ወደ ፓራዳይስ ሆቴል ደብረ ማርቆስ እንኳን ደህና መጡ! እኔ የ24 ሰዓት AI ረዳትዎ ነኝ። ስለ ክፍል ማስያዣ፣ ስለ ጠረጴዛ፣ ስለ ምግብ ትዕዛዝ፣ ስለ ብሔራዊ መታወቂያ ፈጣን ምዝገባ ወይም ስለ ዋጋ በምን ልርዳዎት?',
            om: 'Akkam jirtu! ✨ Baga nagaan gara Hoteela Paaraadaayis Dabra Maarqoos dhuftan! Ani gargaaraa AI keessani. Waa\'ee kutaalee, minjaalaa, nyaataa fi waraqaa eenyummaa sakatta\'uu irratti akkamitti isin gargaaruu danda\'a?',
            ti: 'ሰላም! ✨ ናብ ፓራዳይስ ሆቴል ደብረ ማርቆስ እንቋዕ ብደሓን መጻእኩም! ኣነ ናይ 24 ሰዓት AI ረዳኢኹም እየ። ብዛዕባ ክፍሊ ምትሓዝ፣ ምግቢ ምእዛዝ፣ ጣውላ ምሓዝ ወይ ናይ መታወቂያ ምምርማር ብኸመይ ክሕግዘኩም ይኽእል?'
        }
    }
];

// Helper to detect language of input query
const detectQueryLang = (text, activeLang) => {
    if (/[\u1200-\u137F]/.test(text)) {
        if (text.includes('ከመይ') || text.includes('ክፍሊ') || text.includes('ጣውላ') || text.includes('ዕጾ') || text.includes('ደሓን')) {
            return 'ti';
        }
        return 'am';
    }
    const lower = text.toLowerCase();
    if (lower.includes('akkam') || lower.includes('nagaa') || lower.includes('kutaa') || lower.includes('nyaata') || lower.includes('minjaala') || lower.includes('gatii')) {
        return 'om';
    }
    return activeLang || 'en';
};

// Safe formatting for bold text markdown without dangerouslySetInnerHTML
const renderFormattedText = (text) => {
    if (!text) return '';
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

export default function AIConciergeWidget() {
    const { lang, t } = useContext(LanguageContext);
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [selectedModel, setSelectedModel] = useState('gemini');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const chatEndRef = useRef(null);

    const activeModel = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];

    const getWelcomeMessage = (l) => {
        switch (l) {
            case 'am':
                return 'ሰላም! እኔ በደብረ ማርቆስ ፓራዳይስ ሆቴል የ24 ሰዓት ባለ 5-ኮከብ AI ረዳትዎ ነኝ። ከላይ ያሉትን አዝራሮች በመጠቀም በ Gemini፣ ChatGPT፣ Claude ወይም DeepSeek መካከል መቀያየር ይችላሉ። በምን ልርዳዎት?';
            case 'om':
                return 'Akkam jirtu! Ani gargaaraa AI Hoteela Paaraadaayis Dabra Maarqoos sa\'aatii 24ti. Moodeelota Gemini, ChatGPT, Claude fi DeepSeek gidduutti jijjiiruu dandeessu. Akkamitti isin gargaaruu danda\'a?';
            case 'ti':
                return 'ሰላም! ኣነ ኣብ ደብረ ማርቆስ ፓራዳይስ ሆቴል ናይ 24 ሰዓት ናይ AI ረዳኢኹም እየ። ብሞዴላት Gemini, ChatGPT, Claude ወይ DeepSeek ክትጥቀሙ ትኽእሉ ኢኹም። ብኸመይ ክሕግዘኩም ይኽእል?';
            default:
                return 'Greetings! I am your 5-Star AI Concierge at Paradise Hotel Debre Markos. You can switch between Google Gemini, OpenAI ChatGPT, Anthropic Claude, and DeepSeek above anytime. How may I assist your stay today?';
        }
    };

    const [messages, setMessages] = useState(() => [
        {
            sender: 'concierge',
            text: getWelcomeMessage(lang),
            model: 'gemini',
            modelName: 'Google Gemini 2.0',
            modelColor: '#4285F4'
        }
    ]);

    useEffect(() => {
        const handleOpen = () => {
            setIsOpen(true);
        };
        window.addEventListener('open-ai-concierge', handleOpen);
        return () => window.removeEventListener('open-ai-concierge', handleOpen);
    }, []);

    // Update welcome message if language changes and conversation hasn't started
    useEffect(() => {
        setMessages((prev) => {
            if (prev.length <= 1) {
                return [{
                    sender: 'concierge',
                    text: getWelcomeMessage(lang),
                    model: selectedModel,
                    modelName: activeModel.fullName,
                    modelColor: activeModel.color
                }];
            }
            return prev;
        });
    }, [lang]);

    useEffect(() => {
        if (isOpen && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, isLoading]);

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        const query = input.trim();
        if (!query || isLoading) return;

        const userMsg = { sender: 'user', text: query };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        const currentActiveModel = activeModel;

        try {
            // Build history payload for contextual memory
            const historyPayload = messages
                .filter(m => m.text)
                .slice(-6)
                .map(m => ({
                    role: m.sender === 'user' ? 'user' : 'assistant',
                    content: m.text
                }));

            // Dispatch to backend /api/chat with selected model
            const res = await API.post('/chat', {
                prompt: query,
                model: selectedModel,
                history: historyPayload
            });

            if (res.data && res.data.success && res.data.reply) {
                setMessages((prev) => [
                    ...prev,
                    {
                        sender: 'concierge',
                        text: res.data.reply,
                        model: res.data.model || selectedModel,
                        modelName: res.data.modelInfo?.displayName || currentActiveModel.fullName,
                        modelColor: res.data.modelInfo?.badgeColor || currentActiveModel.color
                    }
                ]);
            } else {
                throw new Error('Invalid chat response from server');
            }
        } catch (err) {
            console.warn('[AI Concierge Live Query Error - using smart fallback]:', err.message);

            // Fallback: smart matching against knowledge base
            const targetLang = detectQueryLang(query, lang);
            const lower = query.toLowerCase();

            let matched = null;
            let highestMatches = 0;
            for (const item of KNOWLEDGE_BASE) {
                let score = 0;
                for (const k of item.keywords) {
                    if (lower.includes(k.toLowerCase())) score += 1;
                }
                if (score > highestMatches) {
                    highestMatches = score;
                    matched = item;
                }
            }

            let fallbackText = '';
            if (matched && matched.answers) {
                fallbackText = matched.answers[targetLang] || matched.answers[lang] || matched.answers.en;
            } else {
                switch (targetLang) {
                    case 'am':
                        fallbackText = `👑 **የፓራዳይስ ሆቴል AI ረዳት** (${currentActiveModel.fullName})\n\nስለ መልዕክትዎ እናመሰግናለን! የሆቴላችን የሪሴፕሽን እና የኮንሲየር ቡድን 24 ሰዓት ዝግጁ ነው። ክፍሎችን ለማስያዝ፣ ምግብ ለማዘዝ ወይም ጠረጴዛ ለመያዝ ከላይ ያሉትን አቋራጭ አዝራሮች መጠቀም ይችላሉ።`;
                        break;
                    case 'om':
                        fallbackText = `👑 **Gargaaraa AI Paaraadaayis** (${currentActiveModel.fullName})\n\nWaa'ee gaaffii keessanii galatoomaa! Hojjattoonni kawaan fi keessummeessaa keenya sa'aatii 24 isin gargaaruuf qophiidha.`;
                        break;
                    case 'ti':
                        fallbackText = `👑 **ናይ ፓራዳይስ ሆቴል AI ረዳኢ** (${currentActiveModel.fullName})\n\nብዛዕባ ሕቶኹም የቐንየልና! ናይ ሆቴልና ሪሴፕሽንን ኣቀባብላን ጋሻ ሰራሕተኛታት ንምሕጋዝኩም 24 ሰዓት ድሉዋት እዮም።`;
                        break;
                    default:
                        fallbackText = `👑 **Paradise Concierge** (${currentActiveModel.fullName})\n\nThank you for your inquiry! Our executive concierge desk is available 24/7. You can reserve luxury suites, order gourmet dining, or book panoramic desks via the quick actions below.`;
                }
            }

            setMessages((prev) => [
                ...prev,
                {
                    sender: 'concierge',
                    text: fallbackText,
                    model: selectedModel,
                    modelName: currentActiveModel.fullName,
                    modelColor: currentActiveModel.color
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAction = (path) => {
        navigate(path);
        setIsOpen(false);
    };

    return (
        <div className="ai-concierge-root">
            {/* Floating Trigger Pill */}
            {!isOpen && (
                <button
                    type="button"
                    id="ai-concierge-trigger"
                    className="ai-concierge-pill-btn ai-concierge-fab animate-fade-in"
                    onClick={() => setIsOpen(true)}
                    title="Open AI Concierge & Model Switcher"
                >
                    <span className="concierge-icon">🛎️</span>
                    <span className="concierge-text">AI Concierge</span>
                    <span className="concierge-model-mini-dot" style={{ background: activeModel.color }} />
                </button>
            )}

            {/* Chat Drawer / Modal */}
            {isOpen && (
                <div className="ai-concierge-panel animate-scale-up">
                    {/* Header */}
                    <div className="ai-concierge-header">
                        <div className="ai-concierge-header-brand">
                            <LuxuryLogo size="small" showText={false} />
                            <div>
                                <div className="concierge-brand-title">Paradise AI Concierge</div>
                                <div className="concierge-brand-sub">Debre Markos · 24/7 Multi-Model Butler</div>
                            </div>
                        </div>

                        <div className="ai-concierge-header-actions">
                            {/* Active Model Indicator Chip in Header */}
                            <div
                                className="concierge-header-active-chip"
                                style={{
                                    borderColor: activeModel.border,
                                    background: activeModel.bgLight
                                }}
                                title={`Active Model: ${activeModel.fullName}`}
                            >
                                <span className="chip-model-icon">{activeModel.icon}</span>
                                <span className="chip-model-name" style={{ color: activeModel.color }}>
                                    {activeModel.name}
                                </span>
                            </div>

                            <button
                                type="button"
                                className="concierge-close-btn"
                                onClick={() => setIsOpen(false)}
                                title="Close Concierge"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Messages Body */}
                    <div className="ai-concierge-body">
                        {messages.map((m, idx) => {
                            const msgModel = AI_MODELS.find(mod => mod.id === m.model);
                            const modelColor = m.modelColor || msgModel?.color || '#d4af37';

                            return (
                                <div key={idx} className={`concierge-msg ${m.sender}`}>
                                    {m.sender === 'concierge' && (
                                        <div className="msg-avatar-wrapper" style={{ color: modelColor }}>
                                            {msgModel ? (
                                                <div className="msg-avatar-icon">{msgModel.icon}</div>
                                            ) : (
                                                <span className="msg-avatar">🛎️</span>
                                            )}
                                        </div>
                                    )}
                                    <div className="msg-bubble-container">
                                        {m.sender === 'concierge' && (m.modelName || msgModel) && (
                                            <div className="msg-model-tag" style={{ color: modelColor }}>
                                                <span className="tag-dot" style={{ background: modelColor }} />
                                                <span>{m.modelName || msgModel.fullName}</span>
                                            </div>
                                        )}
                                        <div className="msg-bubble" style={{ whiteSpace: 'pre-line' }}>
                                            {renderFormattedText(m.text)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Animated Model Thinking Indicator */}
                        {isLoading && (
                            <div className="concierge-msg concierge loading animate-fade-in">
                                <div className="msg-avatar-wrapper" style={{ color: activeModel.color }}>
                                    <div className="msg-avatar-icon">{activeModel.icon}</div>
                                </div>
                                <div className="msg-bubble-container">
                                    <div
                                        className="msg-bubble thinking-bubble"
                                        style={{
                                            borderColor: activeModel.border,
                                            background: activeModel.bgLight
                                        }}
                                    >
                                        <div className="thinking-dots">
                                            <span style={{ background: activeModel.color }} />
                                            <span style={{ background: activeModel.color }} />
                                            <span style={{ background: activeModel.color }} />
                                        </div>
                                        <span className="thinking-text" style={{ color: activeModel.color }}>
                                            {activeModel.thinkingText}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={chatEndRef} />
                    </div>

                    {/* Quick Action Shortcuts */}
                    <div className="ai-concierge-shortcuts">
                        <span className="shortcuts-label">
                            {lang === 'am' ? 'ፈጣን አገልግሎቶች:' : (lang === 'om' ? 'Tajaajila Hatattamaa:' : (lang === 'ti' ? 'ቅልጡፍ ኣገልግሎት:' : 'Quick Actions:'))}
                        </span>
                        <div className="shortcuts-row">
                            <button type="button" onClick={() => handleQuickAction('/rooms')}>
                                🛏️ {t('reserveRooms', 'Reserve Room')}
                            </button>
                            <button type="button" onClick={() => handleQuickAction('/order-food')}>
                                🍽️ {t('orderFood', 'Order Food')}
                            </button>
                            <button type="button" onClick={() => handleQuickAction('/reserve-desk')}>
                                💼 {t('reserveDesk', 'Book Desk')}
                            </button>
                            <button type="button" onClick={() => handleQuickAction('/contact')}>
                                📩 {t('contact', 'Contact Staff')}
                            </button>
                        </div>
                    </div>

                    {/* AI Model Switcher Bar (Pills Tabstrip) */}
                    <AIModelSwitcher
                        selectedModel={selectedModel}
                        onSelectModel={setSelectedModel}
                        disabled={isLoading}
                        viewMode="pills"
                    />

                    {/* Input Bar */}
                    <form onSubmit={handleSend} className="ai-concierge-footer">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={
                                isLoading
                                    ? activeModel.thinkingText
                                    : (lang === 'am'
                                        ? `በ ${activeModel.name} ይጠይቁ...`
                                        : (lang === 'om'
                                            ? `Gaaffii ${activeModel.name} gaafadhaa...`
                                            : (lang === 'ti'
                                                ? `ብ ${activeModel.name} ሕተቱ...`
                                                : `Ask anything via ${activeModel.name}...`)))
                            }
                            className="concierge-input"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className="concierge-send-btn"
                            title={`Send via ${activeModel.name}`}
                            disabled={isLoading || !input.trim()}
                            style={{
                                opacity: isLoading || !input.trim() ? 0.6 : 1,
                                background: activeModel.gradient
                            }}
                        >
                            ➔
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
