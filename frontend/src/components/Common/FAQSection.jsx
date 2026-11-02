import React, { useState, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../../context/LanguageContext';

const FAQ_CARDS = [
    {
        id: 'checkin-fayda',
        category: 'rooms',
        icon: '🛏️',
        badge: {
            en: 'ROOM BOOKING',
            am: 'ክፍል ማስያዣ',
            om: 'KUTAA QABACHUU',
            ti: 'ክፍሊ ምትሓዝ'
        },
        q: {
            en: 'Check-in Times & Fayda ID',
            am: 'የመግቢያ ሰዓት እና የፋይዳ መታወቂያ',
            om: 'Yeroo Seeninsaa fi Eenyummeessaa',
            ti: 'ናይ ምእታው ሰዓትን መታወቂያን'
        },
        a: {
            en: 'Check-in begins at 2:00 PM and check-out is at 11:30 AM. Under Ethiopian law, valid National ID / Fayda or passport is required. Scan your ID card online for instant paperless check-in.',
            am: 'የመግቢያ ሰዓት ከቀኑ 8:00፣ የመውጫ ሰዓት ደግሞ በጠዋቱ 5:30 ነው። በህግ መሰረት ህጋዊ የብሔራዊ መታወቂያ (ፋይዳ) ወይም ፓስፖርት ያስፈልጋል። በኦንላይን በካሜራ መቃኘት ይችላሉ።',
            om: 'Yeroon seeninsaa 8:00 (2:00 PM), ba\'insi immoo 5:30 (11:30 AM) dha. Eenyummeessaa Fayda ykn Paaspoortii qabaachuun dirqama. Kaameeraan sakatta\'uun ni danda\'ama.',
            ti: 'ናይ ምእታው ሰዓት 2:00 PM፣ ናይ ምውጻእ ድማ 11:30 AM እዩ። ብመሰረት ሕጊ ናይ ሃገራዊ መታወቂያ (ፋይዳ) ወይ ፓስፖርት የድሊ። ብካሜራ ብቐሊሉ ስካን ምግባር ይከኣል እዩ።'
        },
        action: {
            link: '/rooms',
            label: {
                en: 'Explore Rooms →',
                am: 'ክፍሎችን ይመልከቱ →',
                om: 'Kutaalee Ilaalaa →',
                ti: 'ክፍልታት ርኣዩ →'
            }
        }
    },
    {
        id: 'free-desk-perk',
        category: 'dining',
        icon: '🍽️',
        badge: {
            en: '100% FREE',
            am: '100% ነፃ',
            om: '100% BILISA',
            ti: '100% ነጻ'
        },
        q: {
            en: 'Free Desk with Food Order',
            am: 'የነጻ ጠረጴዛ ማስያዣ ጥቅማ-ጥቅም',
            om: 'Minjaala Nyaata Waliin Bilisaan',
            ti: 'ናይ ጣውላ ብነጻ ምሓዝ'
        },
        a: {
            en: 'Book any dining or co-working desk and select "Pair with Food Order". Whenever you order any food, snacks, or drinks from our menu, your table reservation fee is 100% waived!',
            am: 'የመመገቢያ ወይም የስራ ጠረጴዛ ሲይዙ "ከምግብ ጋር አጣምር" የሚለውን ይምረጡ። ማንኛውንም ጣፋጭ ምግብ፣ ቁርስ ወይም መጠጥ ሲያዙ የጠረጴዛ ማስያዣ ክፍያው 100% ሙሉ በሙሉ ነፃ ይሆናል!',
            om: 'Minjaala nyaataa ykn hojii qabachuun "Nyaata waliin ajaji" filadhaa. Nyaata, buna ykn dhugaatii yeroo ajajjan, kaffaltiin minjaalaa 100% guutummaatti bilisa ta\'a!',
            ti: 'ናይ መግቢ ወይ ስራሕ ጣውላ ክትሕዙ ከለኹም "ምስ መግቢ ኣተሓሕዝ" ዝብል ምረጹ። ዝኾነ መግቢ ወይ መስተ ምስ ትእዝዙ ናይ ጣውላ ክፍሊት 100% ምሉእ ብምሉእ ነጻ ይኸውን!'
        },
        action: {
            link: '/reserve-desk',
            label: {
                en: 'Reserve a Desk →',
                am: 'ጠረጴዛ ያስይዙ →',
                om: 'Minjaala Qabadhaa →',
                ti: 'ጣውላ ሓዙ →'
            }
        }
    },
    {
        id: 'food-dining',
        category: 'dining',
        icon: '🍕',
        badge: {
            en: 'FOOD & DINING',
            am: 'ምግብ እና መጠጥ',
            om: 'NYAATA FI DHUGAATII',
            ti: 'ምግብን መስተን'
        },
        q: {
            en: 'Dining Hours & Dietary Options',
            am: 'የምግብ ሰዓትና የጾም/ሀላል አማራጮች',
            om: 'Sa\'aatii Nyaataa & Filannoowwan',
            ti: 'ናይ መግቢ ሰዓትን ናይ ጾም ምርጫን'
        },
        a: {
            en: 'Breakfast is served 6:30 AM – 10:30 AM with all-day restaurant dining until 11:00 PM and 24/7 room service. We serve Ethiopian Fasting Beyaynetu, certified Halal dishes, and fresh juices.',
            am: 'ቁርስ ከጠዋቱ 12:30 እስከ 4:30፣ የተሟላ የምግብ አገልግሎት እስከ ምሽቱ 5:00፣ እና የክፍል ውስጥ ትዕዛዝ 24 ሰዓት ይሰጣል። የጾም በያይነቱ፣ የተረጋገጠ ሀላል ስጋ እና የተፈጥሮ ጭማቂዎች ይዘጋጃሉ።',
            om: 'Cireen ganama 12:30 hanga 4:30tti, tajaajilli nyaataa hanga galgala 5:00tti, tajaajilli kutaa immoo sa\'aatii 24 kenna. Nyaata soomaa Beyaynetu, foon Halaal fi cuunfaa qulqulluu qabna.',
            ti: 'ቁርሲ ካብ ንግሆ 12:30 ክሳብ 4:30፣ መግቢ ክሳብ ምሸት 5:00፣ ናይ ክፍሊ ውሽጢ ትእዛዝ ድማ 24 ሰዓት ይቐርብ። ናይ ጾም በያይነቱ፣ ዝተረጋገጸ ሓላል ስጋን ጽሩይ ናይ ፍረታት ጽማቝን ኣለና።`'
        },
        action: {
            link: '/order-food',
            label: {
                en: 'View Full Menu →',
                am: 'የምግብ ዝርዝር ይመልከቱ →',
                om: 'Meeniyuu Guutuu Ilaalaa →',
                ti: 'ምሉእ ሜኑ ርኣዩ →'
            }
        }
    },
    {
        id: 'concierge-support',
        category: 'amenities',
        icon: '📞',
        badge: {
            en: '24/7 AVAILABLE',
            am: '24/7 ዝግጁ',
            om: 'SA\'AATII 24',
            ti: '24 ሰዓት ድሉው'
        },
        q: {
            en: 'Concierge & Direct Reception',
            am: 'የ24 ሰዓት የሪሴፕሽን እና AI Concierge',
            om: 'AI Concierge fi Simannaa 24/7',
            ti: 'ናይ 24 ሰዓት ሪሴፕሽንን AI ደገፍን'
        },
        a: {
            en: 'Continuous support at your fingertips: chat immediately with our 24/7 AI Concierge in 4 languages, call our direct reception line at +251 58 771 2345, or message us via the Contact page.',
            am: 'በማንኛውም ሰዓት በስተቀኝ ጥግ ያለውን አረንጓዴ የ AI Concierge አዝራር በመጫን በ 4 ቋንቋዎች ፈጣን መልስ ያግኙ፣ ወይም በቀጥታ ለሆቴሉ ሪሴፕሽን በስልክ ቁጥር +251 58 771 2345 ይደውሉ።',
            om: 'Yeroo kamiyyuu cuqaasaa "AI Concierge" tuquun afaanota 4n deebii hatattamaa argadhaa, yookiin bilbila simannaa +251 58 771 2345 irratti bilbilaa.',
            ti: 'ኣብ ዝኾነ ሰዓት ነቲ ናይ "AI Concierge" ብምጥዋቕ ብ4 ቋንቋታት ቅልጡፍ መልሲ ርኸቡ፣ ወይ ብቐጥታ ናብ ናይ ሪሴፕሽን ቁጽሪ ተሌፎን +251 58 771 2345 ደውሉ።'
        },
        action: {
            link: '/contact',
            label: {
                en: 'Get in Touch →',
                am: 'ያግኙን →',
                om: 'Nu Qunnamaa →',
                ti: 'ርኸቡና →'
            }
        }
    },
    {
        id: 'payment-methods',
        category: 'payments',
        icon: '💳',
        badge: {
            en: 'PAYMENTS',
            am: 'የክፍያ አማራጭ',
            om: 'KAFFALTII',
            ti: 'ናይ ክፍሊት መንገዲ'
        },
        q: {
            en: 'Telebirr, CBE Birr & Cards',
            am: 'ክፍያዎችና ተቀባይነት ያላቸው ምንዛሬዎች',
            om: 'Telebirr, CBE Birr fi Kaardii',
            ti: 'ቴሌብር፣ ሲቢኢ ብርን ካርድን'
        },
        a: {
            en: 'We accept payments in Ethiopian Birr (ETB) and US Dollars (USD). Pay online with Telebirr, CBE Birr, and Chapa (Visa/Mastercard), or settle with cash or POS at our 24/7 reception.',
            am: 'ክፍያዎችን በኢትዮጵያ ብር (ETB) እና በአሜሪካን ዶላር (USD) እንቀበላለን። በቴሌብር፣ ሲቢኢ ብር፣ በቻፓ (Visa/Mastercard) በኦንላይን ወይም በሪሴፕሽን በጥሬ ገንዘብና በPOS መክፈል ይችላሉ።',
            om: 'Kaffaltii Birrii (ETB) fi Doolaaraan (USD) n fudhanna. Telebirr, CBE Birr, Chapa toora interneetii irratti kaffaluu dandeessu; simannaa irratti kaashii fi POS n ni danda\'ama.',
            ti: 'ክፍሊት ብብር (ETB) ከምኡ\'ውን ብዶላር (USD) ንቕበል ኢና። ብቴሌብር፣ ሲቢኢ ብር፣ ቻፓ ብኦንላይን ወይ ኣብ ሪሴፕሽን ብጥረ ገንዘብን ፖስ (POS) ማሽንን ምኽፋል ይከኣል እዩ።'
        },
        action: {
            link: '/discounts',
            label: {
                en: 'View Rates & Discounts →',
                am: 'ቅናሾችን ይመልከቱ →',
                om: 'Gatii Hir\'ate Ilaalaa →',
                ti: 'ፍሉይ ቅናሽ ርኣዩ →'
            }
        }
    },
    {
        id: 'amenities-wifi',
        category: 'rooms',
        icon: '✨',
        badge: {
            en: '5-STAR LUXURY',
            am: '5-ኮከብ ምቾት',
            om: 'QANANII KURNYA 5',
            ti: '5-ኮኾብ ምቾት'
        },
        q: {
            en: 'Executive Amenities & WiFi',
            am: 'የክፍል ውስጥ አገልግሎቶችና ዋይፋይ',
            om: 'Tajaajila Kutaa fi Wi-Fi',
            ti: 'ኣገልግሎት ክፍሊን ዋይፋይን'
        },
        a: {
            en: 'Every luxury suite features king-size orthopedic beds, high-speed fiber WiFi, Smart 4K TV with international channels, Italian marble bathrooms, work desks, and private scenic balconies.',
            am: 'እያንዳንዱ ክፍል ምቹ ኪንግ-ሳይዝ አልጋ፣ እጅግ ፈጣን ያልተገደበ የፋይበር ዋይፋይ፣ ስማርት 4K ቴሌቪዥን፣ ዘመናዊ መታጠቢያ ቤት፣ የስራ ጠረጴዛ እና የደብረ ማርቆስ እይታ ያለው ሰፊ በረንዳ አለው።`',
            om: 'Kutaaleen hundi siree King-size mijataa, Wi-Fi saffisaa, Smart 4K TV, mana dhiqannaa ammayyaa, minjaala hojii fi balkonii dhuunfaa ilaallata Magaalaa Dabra Maarqoos qabu.',
            ti: 'ነፍሲ ወከፍ ክፍሊ ምቹእ ኪንግ-ሳይዝ ዓራት፣ ቅልጡፍ ዋይፋይ፣ ስማርት 4K ቲቪ፣ ጽሩይ ዓይኒ ምድሪ፣ ናይ ስራሕ ጣውላን ናይ ደብረ ማርቆስ ከተማ ዘርኢ ናይ ባዕልኻ በረንዳን ኣለዎ።'
        },
        action: {
            link: '/rooms',
            label: {
                en: 'Browse Luxury Suites →',
                am: 'ክፍሎችን ያስሱ →',
                om: 'Kutaalee Qananii →',
                ti: 'ምጡቓት ክፍልታት →'
            }
        }
    },
    {
        id: 'cancellation-policy',
        category: 'payments',
        icon: '🔄',
        badge: {
            en: 'FLEXIBLE',
            am: 'ተለዋዋጭ ደንብ',
            om: 'MIJATAA',
            ti: 'ተዓጻጻፊ ሕጊ'
        },
        q: {
            en: 'Cancellation & Rescheduling',
            am: 'ማስያዣን መሰረዝና ቀን መቀየር',
            om: 'Haquu fi Guyyaa Jijjiiruu',
            ti: 'ምስራዝን መዓልቲ ምቕያርን'
        },
        a: {
            en: 'Plans change. Cancel or reschedule your room and desk bookings free of charge up to 24 hours prior to check-in time, seamlessly through your dashboard or via front desk concierge.',
            am: 'የጉዞ ዕቅድ ሊለዋወጥ ይችላል። ያሲዙትን ክፍል ወይም ጠረጴዛ ከመግቢያዎ ቀን 24 ሰዓት በፊት ያለምንም ቅጣት በነፃ መሰረዝ ወይም ቀኑን በዳሽቦርድዎ ላይ ወይ ለሪሴፕሽን ደውለው ማስተካከል ይችላሉ።',
            om: 'Karoorri imalaa jijjiiramuu danda\'a. Kutaalee ykn minjaala qabattan sa\'aatii 24 dura daashboordii keessan irraa yookiin simannaaf bilbiluun bilisaan haquu dandeessu.',
            ti: 'መደብ ክቕየር ይኽእል እዩ። ዝተታሕዘ ክፍል ወይ ጣውላ ቅድሚ ምእታውኩም 24 ሰዓት ኣቐዲምኩም ብዘይ ዝኾነ ቅጽዓት ብዳሽቦርድኹም ወይ ብተሌፎን ብነጻ ክትሰርዙ ትኽእሉ ኢኹም።'
        },
        action: {
            link: '/dashboard/customer',
            label: {
                en: 'Manage Bookings →',
                am: 'የእኔን ቦታዎች ይመልከቱ →',
                om: 'Bakka Qabadhe Ilaalaa →',
                ti: 'ዝተታሕዙ ቦታታት ርኣዩ →'
            }
        }
    },
    {
        id: 'location-transport',
        category: 'amenities',
        icon: '📍',
        badge: {
            en: 'DEBRE MARKOS',
            am: 'ደብረ ማርቆስ',
            om: 'DABRA MAARQOOS',
            ti: 'ደብረ ማርቆስ'
        },
        q: {
            en: 'Location & Free Parking',
            am: 'የሆቴሉ አድራሻና ነፃ ፓርኪንግ',
            om: 'Teessoo fi Geejjiba Konkolaataa',
            ti: 'ኣድራሻ ሆቴልን መጓዓዝያን'
        },
        a: {
            en: 'Located in the heart of Debre Markos, East Gojjam, Amhara Region. We provide private chauffeured transfers upon request. Secure private on-site parking with 24/7 CCTV is 100% complimentary.',
            am: 'በአማራ ክልል በምስራቅ ጎጃም በደብረ ማርቆስ ከተማ እምብርት ላይ እንገኛለን። አስቀድመው ካሳወቁ አስተማማኝ የግል የትራንስፖርት አቀባበል እናዘጋጃለን። በካሜራ (CCTV) የተጠበቀ ነፃ የመኪና ማቆሚያ አለን።',
            om: 'Hoteelli Paaraadaayis Magaalaa Dabra Maarqoos giddu galeessa irratti argama. Duraan dursitanii yoo beeksiftan konkolaataa simannaa ni qopheessina. Bakka doonii konkolaataa CCTV qabu bilisaan jira.',
            ti: 'ኣብ ክልል ኣምሓራ፣ ምብራቕ ጎጃም፣ ኣብ ማእከል ከተማ ደብረ ማርቆስ ንርከብ። ኣቐዲምኩም እንተሓቢርኩምና ናይ መጓዓዝያ ኣገልግሎት ነዳልወልኩም ኢና። ብካሜራ ዝተሓለወ ነጻ ናይ ማኪና መዕረፊ ኣለና።'
        },
        action: {
            link: '/contact',
            label: {
                en: 'View Map & Location →',
                am: 'አድራሻና ካርታ ይመልከቱ →',
                om: 'Kaartaa fi Teessoo →',
                ti: 'ኣድራሻን ካርታን →'
            }
        }
    }
];

const CATEGORIES = [
    {
        id: 'all',
        label: {
            en: 'All Questions',
            am: 'ሁሉም ጥያቄዎች',
            om: 'Gaaffilee Hunda',
            ti: 'ኩሎም ሕቶታት'
        },
        icon: '✨'
    },
    {
        id: 'rooms',
        label: {
            en: 'Suites & Check-In',
            am: 'ክፍሎችና ምዝገባ',
            om: 'Kutaalee & Galmee',
            ti: 'ክፍልታትን ምዝገባን'
        },
        icon: '🛏️'
    },
    {
        id: 'dining',
        label: {
            en: 'Dining & Tables',
            am: 'ምግብና ጠረጴዛ',
            om: 'Nyaata & Minjaala',
            ti: 'ምግብን ጣውላን'
        },
        icon: '🍽️'
    },
    {
        id: 'payments',
        label: {
            en: 'Payments & Rules',
            am: 'ክፍያዎችና ደንቦች',
            om: 'Kaffaltii & Seera',
            ti: 'ክፍሊትን ሕግን'
        },
        icon: '💳'
    },
    {
        id: 'amenities',
        label: {
            en: 'Location & Support',
            am: 'አድራሻና አገልግሎቶች',
            om: 'Bakka & Tajaajila',
            ti: 'ኣድራሻን ኣገልግሎትን'
        },
        icon: '📍'
    }
];

const FAQSection = () => {
    const { lang } = useContext(LanguageContext);
    const activeLang = ['en', 'am', 'om', 'ti'].includes(lang) ? lang : 'en';

    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCards = useMemo(() => {
        return FAQ_CARDS.filter((item) => {
            const matchesCat = activeCategory === 'all' || item.category === activeCategory;
            if (!matchesCat) return false;

            if (!searchQuery.trim()) return true;

            const qText = (item.q[activeLang] || item.q.en || '').toLowerCase();
            const aText = (item.a[activeLang] || item.a.en || '').toLowerCase();
            const badgeText = (item.badge[activeLang] || item.badge.en || '').toLowerCase();
            const qStr = searchQuery.toLowerCase().trim();

            return qText.includes(qStr) || aText.includes(qStr) || badgeText.includes(qStr);
        });
    }, [activeCategory, searchQuery, activeLang]);

    const tSection = {
        badge: {
            en: '✨ 5-STAR GUEST ASSISTANCE',
            am: '✨ 5-ኮከብ የእንግዳ አገልግሎት መመሪያ',
            om: '✨ QAJJELFAMA KEESSUMMOOTAA KURNYA 5',
            ti: '✨ 5-ኮኾብ ናይ ኣጋይሽ ሓበሬታ መምርሒ'
        },
        title: {
            en: 'Frequently Asked Questions',
            am: 'በተደጋጋሚ የሚነሱ ጥያቄዎች እና መልሶቻቸው',
            om: 'Gaaffilee Yeroo Baay\'ee Gaafataman',
            ti: 'ብተደጋጋሚ ዝለዓሉ ሕቶታትን መልስታቶምን'
        },
        subtitle: {
            en: 'Everything you need to know about your luxury stay, gourmet dining, and paperless reservations at Paradise Hotel Debre Markos.',
            am: 'ስለ ክፍል ማስያዝ፣ የምግብ ትዕዛዝ፣ የነጻ ጠረጴዛ መብት እና የሆቴላችን የቅንጦት አገልግሎቶች ማወቅ የሚፈልጓቸው ዋና ዋና መረጃዎች።',
            om: 'Waa\'ee kutaalee, nyaata ajajuu, mirga minjaala bilisaa fi tajaajiloota qananii Paaraadaayis Hoteel hundaa asitti argattu.',
            ti: 'ብዛዕባ ምትሓዝ ክፍልታት፣ ምእዛዝ መግቢ፣ ናይ ነጻ ጣውላ መሰልን ናይ ሆቴልና ምጡቕ ኣገልግሎታትን ክትፈልጥዎም ዝግባእኩም ኣገደስቲ ሓበሬታታት።'
        },
        searchPlaceholder: {
            en: 'Search questions (e.g., Telebirr, Check-in, Fayda ID, Free Desk, WiFi)...',
            am: 'ጥያቄዎችን ይፈልጉ (ለምሳሌ፦ ቴሌብር፣ የመግቢያ ሰዓት፣ ፋይዳ መታወቂያ፣ ነፃ ጠረጴዛ፣ ዋይፋይ)...',
            om: 'Gaaffii barbaadaa (fkn: Telebirr, Check-in, Fayda ID, Minjaala Bilisaa, Wi-Fi)...',
            ti: 'ሕቶታት ድለዩ (ንኣብነት፦ ቴሌብር፣ ናይ ምእታው ሰዓት፣ ፋይዳ መታወቂያ፣ ነጻ ጣውላ፣ ዋይፋይ)...'
        },
        noResults: {
            en: 'No matching questions found. Try searching a different term or ask our AI Concierge.',
            am: 'ከፍለጋዎ ጋር የሚዛመድ ጥያቄ አልተገኘም። እባክዎ ሌላ ቃል ይፈልጉ ወይም በቀጥታ AI Conciergeን ይጠይቁ።',
            om: 'Gaaffiin barbaaddan hin argamne. Jecha biraatiin yaalaa ykn AI Concierge gaafadha.',
            ti: 'ምስ ድሌትኩም ዝመሳሰል ሕቶ ኣይተረኽበን። ብኻልእ ቃል ፈትኑ ወይ ንAI Concierge ሕተቱ።'
        },
        stillHaveQuestions: {
            en: 'Still Have Questions?',
            am: 'ተጨማሪ ያልተመለሰ ጥያቄ አለዎት?',
            om: 'Gaaffii dabalataa qabduu?',
            ti: 'ተወሳኺ ዘይተመለሰ ሕቶ ኣለኩም ድዩ?'
        },
        stillHaveQuestionsDesc: {
            en: 'Our 24/7 AI Concierge and Front Desk team in Debre Markos are always here to ensure your comfort.',
            am: 'የ24 ሰዓት የ AI Concierge ረዳታችን እና በደብረ ማርቆስ የሚገኘው የሪሴፕሽን ቡድናችን ሁልጊዜም እርስዎን ለማገልገል ዝግጁ ናቸው።',
            om: 'AI Concierge fi hojjattoonni keenya sa\'aatii 24 isin tajaajiluuf qophiidha.',
            ti: 'ናይ 24 ሰዓት AI Concierge ሓጋዚናን ኣብ ደብረ ማርቆስ ዝርከብ ናይ ሪሴፕሽን ሰራሕተኛታትናን ንምሕጋዝኩም ድሉዋት እዮም።'
        },
        chatWithAI: {
            en: '🤖 Chat with AI Concierge',
            am: '🤖 ከ AI Concierge ጋር ያውሩ',
            om: '🤖 AI Concierge Haasofsiisaa',
            ti: '🤖 ምስ AI Concierge ኣዕልሉ'
        },
        callFrontDesk: {
            en: '📞 Call Reception (+251 58 771 2345)',
            am: '📞 ወደ ሪሴፕሽን ይደውሉ (+251 58 771 2345)',
            om: '📞 Simannaa Bilbilaa (+251 58 771 2345)',
            ti: '📞 ናብ ሪሴፕሽን ደውሉ (+251 58 771 2345)'
        }
    };

    const handleOpenAIWidget = () => {
        window.dispatchEvent(new CustomEvent('open-ai-concierge'));
        const fab = document.getElementById('ai-concierge-trigger') || document.querySelector('.ai-concierge-pill-btn') || document.querySelector('.ai-concierge-fab');
        if (fab) {
            fab.click();
        }
    };

    return (
        <section className="luxury-faq-section" id="faq-section">
            <div className="section-title-wrap text-center" style={{ marginBottom: 28 }}>
                <span className="luxury-badge" style={{ marginBottom: 12, display: 'inline-block' }}>
                    {tSection.badge[activeLang]}
                </span>
                <h2 className="faq-main-title">
                    {tSection.title[activeLang]}
                </h2>
                <p className="section-desc" style={{ maxWidth: 780, margin: '0 auto', color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.6 }}>
                    {tSection.subtitle[activeLang]}
                </p>
            </div>

            {/* Controls Bar: Category Pills + Search */}
            <div className="faq-controls-bar">
                <div className="faq-category-pills">
                    {CATEGORIES.map((cat) => {
                        const isActive = activeCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                className={`faq-category-pill ${isActive ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat.id)}
                            >
                                <span className="cat-icon">{cat.icon}</span>
                                <span>{cat.label[activeLang]}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="faq-search-row">
                    <div className="faq-search-input-wrap">
                        <span className="faq-search-icon">🔍</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={tSection.searchPlaceholder[activeLang]}
                            className="faq-search-input"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="faq-search-clear"
                                onClick={() => setSearchQuery('')}
                                title="Clear search"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 4-Column Box Cards Grid matching the image */}
            <div className="services-luxury-grid faq-boxes-grid">
                {filteredCards.map((item) => (
                    <div key={item.id} className="service-card luxury-card faq-card-box">
                        <div className="service-card-top">
                            <span className="service-icon">{item.icon}</span>
                            <span className="service-badge">{item.badge[activeLang] || item.badge.en}</span>
                        </div>
                        <h3>{item.q[activeLang] || item.q.en}</h3>
                        <p>{item.a[activeLang] || item.a.en}</p>
                        <div className="service-card-footer">
                            <Link to={item.action.link} className="explore-link">
                                {item.action.label[activeLang] || item.action.label.en}
                            </Link>
                        </div>
                    </div>
                ))}

                {filteredCards.length === 0 && (
                    <div className="faq-empty-card luxury-card text-center" style={{ gridColumn: '1 / -1', padding: '36px 20px' }}>
                        <span style={{ fontSize: 36, display: 'block', marginBottom: 10 }}>🔍</span>
                        <p style={{ color: 'var(--text-muted)', fontSize: 15, margin: '0 0 14px' }}>
                            {tSection.noResults[activeLang]}
                        </p>
                        <button
                            type="button"
                            className="btn btn-luxury-gold"
                            onClick={() => {
                                setSearchQuery('');
                                setActiveCategory('all');
                            }}
                        >
                            Reset Filter
                        </button>
                    </div>
                )}
            </div>

            {/* Bottom 24/7 Concierge Support Banner */}
            <div className="faq-support-banner luxury-card">
                <div className="support-banner-left">
                    <span className="support-crest-icon">🛎️</span>
                    <div>
                        <h3 className="support-banner-title" style={{ margin: 0, fontSize: 19, fontFamily: 'var(--font-heading)' }}>
                            {tSection.stillHaveQuestions[activeLang]}
                        </h3>
                        <p className="support-banner-desc" style={{ margin: '4px 0 0', fontSize: 14 }}>
                            {tSection.stillHaveQuestionsDesc[activeLang]}
                        </p>
                    </div>
                </div>

                <div className="support-banner-actions">
                    <button
                        type="button"
                        className="btn btn-luxury-gold"
                        onClick={handleOpenAIWidget}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                    >
                        {tSection.chatWithAI[activeLang]}
                    </button>
                    <a
                        href="tel:+251587712345"
                        className="btn btn-luxury-outline"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                        {tSection.callFrontDesk[activeLang]}
                    </a>
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
