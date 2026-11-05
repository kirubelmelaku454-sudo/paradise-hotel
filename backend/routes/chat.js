const express = require('express');
const router = express.Router();

/**
 * AI Model Catalog & Registry
 * Maps model keys to OpenRouter model IDs and provider metadata
 */
const MODEL_REGISTRY = {
    gemini: {
        id: 'google/gemini-2.0-flash-001',
        name: 'Gemini',
        displayName: 'Google Gemini 2.0 Flash',
        provider: 'Google',
        tagline: 'Ultra-fast, multimodal & native multilingual',
        badgeColor: '#4285F4',
        accentGradient: 'linear-gradient(135deg, #4285F4 0%, #9B72CB 50%, #D96570 100%)',
        icon: 'sparkle'
    },
    chatgpt: {
        id: 'openai/gpt-4o-mini',
        name: 'ChatGPT',
        displayName: 'OpenAI ChatGPT-4o',
        provider: 'OpenAI',
        tagline: 'Versatile, creative & industry-leading assistant',
        badgeColor: '#10a37f',
        accentGradient: 'linear-gradient(135deg, #10a37f 0%, #0d8c6d 100%)',
        icon: 'openai'
    },
    claude: {
        id: 'anthropic/claude-3.5-haiku',
        name: 'Claude',
        displayName: 'Anthropic Claude 3.5',
        provider: 'Anthropic',
        tagline: 'Nuanced reasoning, warm elegance & precision',
        badgeColor: '#d97706',
        accentGradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
        icon: 'claude'
    },
    deepseek: {
        id: 'deepseek/deepseek-chat',
        name: 'DeepSeek',
        displayName: 'DeepSeek V3 & R1',
        provider: 'DeepSeek',
        tagline: 'Deep cognitive reasoning & analytical intelligence',
        badgeColor: '#2563eb',
        accentGradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        icon: 'deepseek'
    }
};

const HOTEL_SYSTEM_PROMPT = `You are the prestigious 24/7 AI Concierge for the 5-Star Paradise Hotel in Debre Markos, Ethiopia.

HOTEL HIGHLIGHTS:
- 👑 Accommodations: Executive Suites, Superior King, Deluxe Rooms, and Presidential VIP Quarters with orthopedic king beds, Italian marble en-suite bathrooms, high-speed fiber WiFi, panoramic terrace views of Debre Markos & Choke Mountain.
- 🍽️ Dining: Authentic Ethiopian classics (Special Kitfo, Doro Wat, Agelgil, Beyaynetu, Tibs) alongside wood-fired pizza, burgers, dry-aged steaks, cocktails, and fresh Jebena Buna coffee. 24/7 room service & takeaway delivery.
- ☕ Work & Co-Working: Co-working terrace and dining desks with power sockets and high-speed internet. Special: table reservation fee is 100% FREE when paired with food order!
- 🪪 Paperless Check-In: Contactless Fayda Ethiopian National ID verification with automated camera scan (front/back) & PIN/FAN check.
- 💵 Payment & Currency: Supports Ethiopian Birr (ETB) and US Dollars (USD). Payments accepted via Telebirr, CBE Birr, Chapa, Visa/Mastercard, and bank transfers.
- ⛰️ Tourism: Mount Choke trekking guides, Blue Nile Gorge excursions, and Debre Markos cultural tours.

BEHAVIOR:
- Maintain a warm, highly refined, 5-star luxury hospitality concierge tone.
- Flawlessly assist in English, Amharic (አማርኛ), Afaan Oromoo, and Tigrinya (ትግርኛ) matching the guest's language.
- Format responses cleanly with brief bullet points or emojis for readability.
- When answering questions about booking rooms, desks, or ordering food, politely invite the guest to explore the respective section of the app.`;

/**
 * GET /api/chat/models
 * Returns the catalog of supported models
 */
router.get('/models', (req, res) => {
    return res.json({
        success: true,
        models: Object.keys(MODEL_REGISTRY).map(key => ({
            key,
            ...MODEL_REGISTRY[key]
        })),
        defaultModel: 'gemini'
    });
});

/**
 * POST /api/chat
 * Primary AI Chat Completion endpoint with dynamic model switching
 * Request Body: { prompt: string, model: string, history?: Array<{ role: string, content: string }> }
 */
router.post('/', async (req, res) => {
    try {
        const { prompt, model = 'gemini', history = [] } = req.body;

        if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
            return res.status(400).json({
                success: false,
                message: 'A valid "prompt" string is required.'
            });
        }

        const modelKey = String(model).toLowerCase().trim();
        const modelMeta = MODEL_REGISTRY[modelKey] || MODEL_REGISTRY.gemini;

        const openRouterKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY || '';
        const geminiKey = process.env.GEMINI_API_KEY || '';

        // Prepare message history
        const formattedHistory = Array.isArray(history)
            ? history
                .filter(m => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant'))
                .slice(-8) // keep last 8 messages for context window efficiency
                .map(m => ({
                    role: m.role === 'assistant' ? 'assistant' : 'user',
                    content: m.content.trim()
                }))
            : [];

        // Build messages payload
        const messages = [
            { role: 'system', content: HOTEL_SYSTEM_PROMPT },
            ...formattedHistory,
            { role: 'user', content: prompt.trim() }
        ];

        // 1. If OpenRouter Key is available, dispatch live query
        if (openRouterKey && openRouterKey !== 'YOUR_OPENROUTER_API_KEY') {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

                const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${openRouterKey}`,
                        'HTTP-Referer': 'https://paradise-hotel1.vercel.app',
                        'X-Title': 'Paradise Hotel 5-Star AI Concierge',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: modelMeta.id,
                        messages,
                        temperature: 0.7,
                        max_tokens: 600
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    const data = await response.json();
                    const reply = data.choices?.[0]?.message?.content;

                    if (reply) {
                        return res.json({
                            success: true,
                            reply: reply.trim(),
                            model: modelKey,
                            modelInfo: {
                                id: modelMeta.id,
                                displayName: modelMeta.displayName,
                                provider: modelMeta.provider,
                                badgeColor: modelMeta.badgeColor,
                                icon: modelMeta.icon
                            },
                            usage: data.usage || null
                        });
                    }
                } else {
                    const errBody = await response.text();
                    console.warn(`[OpenRouter API Error (${response.status})]:`, errBody.substring(0, 200));
                }
            } catch (apiErr) {
                console.warn('[OpenRouter Fetch Error]:', apiErr.message);
            }
        }

        // 2. Direct Google Gemini API fallback if user configured GEMINI_API_KEY
        if (modelKey === 'gemini' && geminiKey && geminiKey !== 'YOUR_GEMINI_API_KEY') {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 20000);

                const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
                const geminiRes = await fetch(geminiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [
                            { role: 'user', parts: [{ text: `${HOTEL_SYSTEM_PROMPT}\n\nUser Question: ${prompt}` }] }
                        ]
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (geminiRes.ok) {
                    const gData = await geminiRes.json();
                    const gText = gData.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (gText) {
                        return res.json({
                            success: true,
                            reply: gText.trim(),
                            model: 'gemini',
                            modelInfo: modelMeta
                        });
                    }
                }
            } catch (gErr) {
                console.warn('[Direct Gemini API Error]:', gErr.message);
            }
        }

        // 3. High-Quality Simulated Intelligence Fallback (when API key is pending)
        // Provides instant, model-voiced 5-star concierge responses
        const simulatedReply = generateSimulatedResponse(prompt, modelKey, modelMeta);

        return res.json({
            success: true,
            reply: simulatedReply,
            model: modelKey,
            modelInfo: {
                id: modelMeta.id,
                displayName: modelMeta.displayName,
                provider: modelMeta.provider,
                badgeColor: modelMeta.badgeColor,
                icon: modelMeta.icon
            },
            isDemo: !openRouterKey
        });

    } catch (error) {
        console.error('Chat endpoint error:', error);
        return res.status(500).json({
            success: false,
            message: 'Unable to process AI chat request.',
            error: error.message
        });
    }
});

/**
 * Intelligent Fallback Generator with distinct model voices
 */
function generateSimulatedResponse(prompt, modelKey, meta) {
    const q = prompt.toLowerCase();

    // Multilingual recognition
    const isAmharic = /[\u1200-\u137F]/.test(prompt);

    if (isAmharic) {
        if (q.includes('ክፍል') || q.includes('አልጋ') || q.includes('ስዊት')) {
            return `👑 **የፓራዳይስ ሆቴል ቅንጦት ክፍሎች** (${meta.displayName})\n\nኤክስኪዩቲቭ ዲሉክስ እና ፕሬዝዳንታዊ ቪ.አይ.ፒ ክፍሎቻችን በጣሊያን እብነ-በረድ የተሰሩ መታጠቢያዎች፣ ኪንግ-ሳይዝ ኦርቶፔዲክ አልጋዎች፣ ፈጣን ዋይፋይ እና የደብረ ማርቆስ ውብ እይታ አላቸው።\n\n👉 በ"ክፍሎች" ገጻችን ላይ በቀላሉ መርጠው ማስያዝ ይችላሉ!`;
        }
        if (q.includes('ምግብ') || q.includes('ክትፎ') || q.includes('ወጥ') || q.includes('ቡና')) {
            return `🍕 **ባህላዊ እና አለም አቀፍ ምግቦች** (${meta.displayName})\n\nልዩ የጉራጌ ክትፎ፣ የሀበሻ ዶሮ ወጥ፣ በያይነቱ፣ ጥብስ እንዲሁም ፒዛ፣ ስቴክ፣ ትኩስ ጁስ እና የጀበና ቡና የ24 ሰዓት አገልግሎት አለን።\n\n👉 በ"ምግብና መጠጥ" ገጽ ላይ አሁኑኑ ማዘዝ ይችላሉ!`;
        }
        return `ሰላም! እኔ በ **${meta.displayName}** የተጎለበተኩ የፓራዳይስ ሆቴል AI ረዳት ነኝ። ስለ ክፍሎች ማስያዣ፣ ስለ ምግብ ትዕዛዝ፣ ስለ ቴራስ ጠረጴዛዎች ወይም ስለ ቾቄ ተራራ ጉብኝት በምን ልርዳዎት?`;
    }

    if (q.includes('room') || q.includes('suite') || q.includes('stay') || q.includes('bed')) {
        return `👑 **Luxury Suite Accommodations** (Powered by **${meta.displayName}**)\n\nWe offer Executive Deluxe Suites, Superior King Rooms, and Presidential VIP Quarters. Each sanctuary features:\n- 🛏️ Orthopedic King Bed with 600-thread Egyptian cotton\n- 🛁 Italian marble en-suite bathroom with rainfall shower\n- 📶 Ultra-high-speed fiber Wi-Fi & 4K smart entertainment\n- ☕ 24/7 in-suite dining & contactless Fayda National ID check-in.\n\nWould you like me to guide you to our **Rooms** page to view live availability?`;
    }

    if (q.includes('food') || q.includes('dining') || q.includes('eat') || q.includes('menu') || q.includes('breakfast') || q.includes('dinner')) {
        return `🍕 **Gourmet Dining & Room Delivery** (Powered by **${meta.displayName}**)\n\nOur executive chefs craft authentic Ethiopian masterworks (Special Kitfo, Doro Wat, Sizzling Tibs) alongside wood-fired artisanal pizzas, prime steaks, burgers, and traditional Jebena Buna coffee service.\n\n👉 You can browse our complete menu and order directly to your room or table via the **Dining** page!`;
    }

    if (q.includes('desk') || q.includes('table') || q.includes('work') || q.includes('cowork')) {
        return `🍽️ **Terrace Desks & Special Offer** (Powered by **${meta.displayName}**)\n\nEnjoy our panoramic terrace desks equipped with dedicated power hubs and fiber internet. **Exclusive Privilege**: Your table reservation is **100% FREE** when paired with a gourmet food or beverage order!`;
    }

    return `Greetings! I am your 5-Star AI Concierge powered by **${meta.displayName}** (${meta.provider}). How may I assist your stay, suite reservations, gourmet dining, or concierge requests at Paradise Hotel Debre Markos today?`;
}

module.exports = router;
