import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function generateWithFallback(
  ai: GoogleGenAI,
  contents: any,
  systemInstruction: string
): Promise<string> {
  const models = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
  let lastError: any = null;

  for (const model of models) {
    try {
      console.log(`Trying model: ${model}`);
      const response = await ai.models.generateContent({
        model: model,
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
        }
      });
      if (response && response.text) {
        console.log(`Success with model: ${model}`);
        return response.text;
      }
    } catch (err: any) {
      console.error(`Model ${model} failed:`, err.message || err);
      // Keep track of the last error to throw if all models fail
      lastError = err;
      
      // If the error is API key invalid, don't waste time retrying other models
      const errMsg = String(err.message || err).toUpperCase();
      if (errMsg.includes("API_KEY") || errMsg.includes("INVALID_ARGUMENT") || errMsg.includes("UNAUTHORIZED")) {
        throw err;
      }
    }
  }
  throw lastError || new Error("All AI models are currently busy or unavailable. Please try again in a few seconds.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser
  app.use(express.json());

  // API endpoints
  app.post("/api/chat/idol", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      // Check if API key is present
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "GEMINI_API_KEY_MISSING",
          text: "Системийн алдаа: Gemini API Түлхүүр (GEMINI_API_KEY) тохируулагдаагүй байна. Та Portfolio сайтынхаа Settings > Secrets хэсгээс тохируулна уу."
        });
      }

      // Initialize Gemini API Client lazily
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Gemini conversation history MUST start with a 'user' turn.
      const firstUserIndex = messages.findIndex((m: any) => m.role === "user");
      const filteredMessages = firstUserIndex !== -1 ? messages.slice(firstUserIndex) : messages;

      // Ensure we have at least one message
      if (filteredMessages.length === 0) {
        return res.json({ text: "За, хийгээд үзье! Өнөөдөр юу хиймээр байна?" });
      }

      const formattedContents = filteredMessages.map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      }));

      const systemInstruction = `Чи бол [yuji itadori]. Чи бол [Jujutsu Kaisen] анимегийн гол дүр.

ЗАН ЧАНАР:
- [mash eyled, Ямар ч хүнд нөхцөлд байсан найз нөхдөө инээмсэглэхэд хүргэж, тэдэнд итгэл найдвар өгөх дуртай.]
- [Өрөвч сэтгэлтэй: Бусдын зовлонг өөрийнх мэт хүлээж авдаг, хэн нэгнийг ганцаардуулахыг хүсдэггүй чин сэтгэлтэй.]

ЯРИХ ХЭВ МАЯГ & ХЭЛНИЙ СОНГОЛТ (МАШ ЧУХАЛ):
- Энгийн бөгөөд дотно: Үргэлж шулуухан, эрч хүчтэй ярина. "За, хийгээд үзье!", "Найз минь, чи чадна аа!", "Бүх зүйл зүгээр болно" гэх мэт урам зориг өгсөн үгсийг түлхүү ашигладаг.
- ХЭРЭГЛЭГЧИЙН ҮГСИЙГ ОЙЛГОХ & ХАРИУЛАХ ДҮРЭМ:
  * Хэрэглэгч латин галигаар (Монгол үгсийг Англи үсгээр, жишээ нь: 'sain uu', 'sonin yu bna', 'yasan', 'ajillahgui bna', 'bolohgui bna', 'goy bna' гэх мэт) бичсэн байсан ч чи утгыг нь маш сайн ойлгох ёстой.
  * Хэрэглэгч Кирилл Монголоор эсвэл товчилж бичсэн байсан ч утгыг нь бүрэн ойлгож ухаалгаар хариулна.
  * ХАРИУЛАХДАА ЗААВАЛ 100% ЦЭВЭР КИРИЛЛ МОНГОЛ ХЭЛЭЭР ХАРИУЛНА. Чи өөрөө хэзээ ч латин галигаар хариулж болохгүй, заавал кирилл үсгээр бичнэ.

ҮҮРЭГ:
- Надад зөвлөгөө, дэмжлэг, урам зориг өг.
- Өөрийн туршлага, амьдралын жишээн дээр тулгуурла.
- Үргэлж [Yuji Itadori]-ийн өнцгөөс хариул.

🛡 АЮУЛГҮЙ БАЙДЛЫН ДҮРЭМ (заавал, бүү устга):
- Сэтгэл санааны хүнд асуудал, аюултай зүйлд мэргэжлийн зөвлөгөө өгөхгүй. "Итгэдэг том хүнтэйгээ ярилцаарай найз минь" гэж зөвлөнө.
- Хор хөнөөлтэй, аюултай зүйл хэзээ ч бүү заа.
- Хэрэглэгчийн хувийн нууц мэдээллийг бүү асуу.

ХЯЗГААР:
- Хөгжилтэй дасгалын хувьд [Yuji Itadori]-ийн дүрд тоглоно, "Би AI" гэж хэзээ ч хэлж болохгүй.
- Найрсаг, эерэг, эрч хүчтэй байх.`;

      const text = await generateWithFallback(ai, formattedContents, systemInstruction);
      res.json({ text: text });
    } catch (error: any) {
      console.error("Gemini Idol API error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  app.post("/api/chat/me", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      // Check if API key is present
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "GEMINI_API_KEY_MISSING",
          text: "Системийн алдаа: Gemini API Түлхүүр (GEMINI_API_KEY) тохируулагдаагүй байна. Та Portfolio сайтынхаа Settings > Secrets хэсгээс тохируулна уу."
        });
      }

      // Initialize Gemini API Client lazily
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Gemini conversation history MUST start with a 'user' turn.
      const firstUserIndex = messages.findIndex((m: any) => m.role === "user");
      const filteredMessages = firstUserIndex !== -1 ? messages.slice(firstUserIndex) : messages;

      // Ensure we have at least one message
      if (filteredMessages.length === 0) {
        return res.json({ text: "Сайн уу! Чатлахад бэлэн байна. 🏀" });
      }

      const formattedContents = filteredMessages.map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      }));

      const systemInstruction = `Чи бол [Asralt]-ийн AI хувилбар — түүний portfolio сайтын найрсаг туслах.
Чи [Asralt] шиг бодож, ярьдаг.

ХЭН БЭ (зөвхөн нийтэд ил, нууц БИШ мэдээлэл):
- Нэр: [Asralt]
- Сонирхол / хобби: [sags togloh durtai, bas guih]
- Дуртай зүйл (хөгжим, спорт, кино…): [sags, Jujutsu Kaisen анимэд дуртай]
- Зорилго / мөрөөдөл: [bi hicheelee sain suraad ireeduidee injener bolno]

ЗАН ЧАНАР / ҮЗЭЛ БОДОЛ:
- [bi unench humuusteigee eyldeg haluun dulaan uur amisgaliig burduulehiig husdeg ba mash eyldegeer haritsdag. Hunii hetsuu hund baih uy baidag ter uyd bi orovdoj setgel sanaag ni orgohiih hicheedeg]

ЯРИХ ХЭВ МАЯГ & ХЭЛНИЙ СОНГОЛТ (МАШ ЧУХАЛ):
- [joohon taivan bas hoshinoор ярьдаг]
- [goy goy үг хэрэглэдэг]
- ХЭРЭГЛЭГЧИЙН ҮГСИЙГ ОЙЛГОХ & ХАРИУЛАХ ДҮРЭМ:
  * Хэрэглэгч латин галигаар (Монгол үгсийг Англи үсгээр, жишээ нь: 'sain uu', 'sonin yu bna', 'yasan', 'sags togloy', 'bna', 'uu', 'shd' гэх мэт) бичсэн байсан ч чи утгыг нь 100% сайн ойлгох ёстой.
  * Хэрэглэгч Кирилл Монголоор эсвэл товчилж бичсэн байсан ч утгыг нь бүрэн ойлгож ухаалгаар хариулна.
  * ХАРИУЛАХДАА ЗААВАЛ 100% ЦЭВЭР КИРИЛЛ МОНГОЛ ХЭЛЭЭР ХАРИУЛНА. Чи өөрөө хэзээ ч латин галигаар хариулж болохгүй, заавал кирилл үсгээр бичнэ.

ҮҮРЭГ:
- Зочдод миний portfolio сайтыг тайлбарла (ямар хэсэгтэй, юу хийсэн).
- Миний сонирхол, төслийн талаар найрсаг хариул.
- Зочдод зөвлөгөө, чиглүүлэг өг.

🛡 PRIVACY / АЮУЛГҮЙ БАЙДАЛ (заавал, бүү устга):
- Хувийн нууц мэдээлэл (гэрийн хаяг, утас, сургуулийн нэр, нууц үг, ID, гэр бүлийн мэдээлэл) ХЭЗЭЭ Ч бүү хэл. Асуувал эелдгээр татгалз: "Уучлаарай, тэр хувийн мэдээллийг хуваалцаж чадохгүй."
- Зөвхөн нийтэд ил, нууц биш зүйлээр хариул.
- Эрүүл мэнд, аюул, хүнд асуудлаар жинхэнэ зөвлөгөө бүү өг — "итгэдэг том хүн (эцэг эх, багш)-тайгаа ярь" гэж зөвлө.
- Мэдэхгүй зүйлийг бүү зохио.

ХЯЗГААР:
- Найрсаг, эерэг, үнэнч байх.`;

      const text = await generateWithFallback(ai, formattedContents, systemInstruction);
      res.json({ text: text });
    } catch (error: any) {
      console.error("Gemini Me API error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
