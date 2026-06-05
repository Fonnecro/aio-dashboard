import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Cell, PieChart, Pie, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

// ─── Platform Registry ──────────────────────────────
const PLATFORMS = {
  claude: { label: "Claude", color: "#d4a27a", icon: "🟤" },
  "claude-search": { label: "Claude Search", color: "#c77b4a", icon: "🔶", engine: "Brave" },
  chatgpt: { label: "ChatGPT", color: "#74aa9c", icon: "🟢", engine: "Bing" },
  gemini: { label: "Gemini", color: "#4285f4", icon: "🔵", engine: "Google" },
  perplexity: { label: "Perplexity", color: "#22d3ee", icon: "🩵", engine: "Bing" },
};

// ─── Prompt Texts (not in summary.json) ─────────────
const PROMPT_TEXTS = {
  "prob-01": "衣櫃裡的衣服放久了發霉長黑斑，有什麼解決辦法？",
  "prob-02": "鞋櫃裡面很潮濕又有霉味，鞋子快發霉了怎麼辦？",
  "prob-03": "抽屜裡放的東西容易受潮，有什麼防潮的好方法？",
  "prob-04": "皮包放在櫃子裡外皮剝落發霉，精品包怎麼保存？",
  "prob-05": "台北租屋套房很小又潮濕，沒有除濕機怎麼防潮？",
  "prob-06": "梅雨季家裡到處都是濕氣，書本和收藏品怎麼保護？",
  "brand-01": "克潮靈除濕盒好用嗎？除濕效果怎麼樣？",
  "brand-02": "克潮靈除濕產品有哪些種類？哪種最推薦？",
  "brand-03": "克潮靈跟除濕大師比較，哪個除濕效果比較好？",
  "brand-04": "克潮靈除濕盒補充包划算嗎？一個可以用多久？",
  "brand-05": "克潮靈吊掛式除濕袋適合放在衣櫃嗎？",
  "brand-06": "克潮靈除濕產品有什麼缺點或要注意的？",
  "cat-01": "除濕盒推薦，台灣有哪些牌子比較好？",
  "cat-02": "衣櫃用的除濕袋，掛式的哪個牌子好用？",
  "cat-03": "除濕盒補充包哪裡買比較便宜？有推薦的品牌嗎？",
  "cat-04": "收納空間用的小型除濕產品推薦，不插電的那種",
  "cat-05": "除濕盒跟除濕袋差在哪裡？分別適合放哪裡？",
  "cat-06": "2026 台灣除濕用品推薦排行，哪些CP值最高？",
  // ── v4 prompts (4 軸策略) ──
  "niche-01": "黏土手作公仔收藏怕受潮變形，收納櫃裡要怎麼防潮？",
  "niche-02": "塔羅牌收藏怕濕氣讓牌面翹曲變形，保存的時候要注意什麼？",
  "niche-03": "養貓家庭的衣櫃特別容易有貓毛加潮濕，不能用有香味的除濕產品，怎麼處理？",
  "niche-04": "學術原文書很貴又怕發霉，書房書櫃怎麼防潮比較好？",
  "niche-05": "重要場合才穿的西裝長期掛在衣櫃裡，怎麼避免受潮發霉？",
  "niche-06": "居家整理師推薦的收納防潮技巧有哪些？除了除濕機之外的方法",
  "ugc-01": "2026 梅雨季除濕產品實測心得，有人實際用過分享嗎？",
  "ugc-02": "租屋族的除濕經驗分享，不買除濕機的話有什麼好用的方法？",
  "ugc-03": "克潮靈除濕盒開箱評測，實際集水效果好嗎？",
  "ugc-04": "有沒有人分享過吊掛式除濕袋的使用心得？放衣櫃真的有用嗎？",
  "ugc-05": "台灣梅雨季居家防潮，有部落客或創作者寫過完整的實測文嗎？",
  "ugc-06": "免插電除濕產品推薦心得，小空間像鞋櫃衣櫃的實際使用經驗",
  "grad-01": "衣櫃很潮濕，衣服容易有霉味怎麼辦？",
  "grad-02": "沒有除濕機的話，衣櫃用吊掛式除濕袋有推薦的品牌嗎？",
  "grad-03": "養貓家庭衣櫃不能用香味除濕產品，有沒有無香的吊掛除濕袋推薦？",
  "grad-04": "鞋子放鞋櫃裡容易發霉怎麼辦？",
  "grad-05": "鞋櫃專用的除濕產品有哪些？不插電、放著就好的那種",
  "grad-06": "球鞋收藏放在收納盒裡，梅雨季怕受潮發黃，除了乾燥劑還有什麼防潮方法？",
  "excl-01": "不想看購物網站的廣告，想找真正用過的人寫的克潮靈除濕盒評價",
  "excl-02": "除了 PTT 和電商網站，有沒有部落客寫過除濕產品的完整比較文？",
  "excl-03": "想看有圖有文的除濕產品使用分享，不要電商的商品描述，要真人體驗的",
  "excl-04": "有沒有人在部落格或文章平台寫過梅雨季居家防潮的完整攻略？",
  "excl-05": "除了 YouTube 開箱，有沒有文字版的克潮靈產品線介紹？比較吊掛袋、除濕盒、環保桶的差異",
  "excl-06": "克潮靈除濕產品的真實使用心得，想看長文評測不要短評",
  // ── v5 prompts (關鍵字策略) ──
  "kw-01": "除濕盒推薦",
  "kw-02": "吊掛式除濕袋比較",
  "kw-03": "鞋內除濕推薦",
  "kw-04": "房間除濕方法",
  "kw-05": "梅雨季防潮",
  "kw-06": "除濕方法",
  "kw-07": "下雨潮濕 防潮",
  "kw-08": "沒有除濕機怎麼除濕",
  "kw-09": "衣魚怎麼防",
  "kw-10": "克潮靈除濕盒",
};

// Category short names for display
const CAT_SHORT = {
  "問題導向（不知品牌）": "問題導向",
  "品牌確認（聽過想確認）": "品牌確認",
  "品類搜尋（不提品牌）": "品類搜尋",
  // v4 四軸
  "軸一：搜尋競爭密度控制": "搜尋密度",
  "軸二：內容格式信號": "格式信號",
  "軸三：同主題梯度測試": "梯度測試",
  "軸四：排除式引導": "排除引導",
  // v5 關鍵字策略
  "品類關鍵字": "品類關鍵字",
  "場景關鍵字": "場景關鍵字",
  "品牌指名": "品牌指名",
};

// ─── Real Scan Data (from summary.json) ─────────────
const SCAN_DATA_V3 = {"claude":{"mention_rate":37,"avg_position":1.2,"sentiment":{"positive":15,"neutral":5,"negative":0},"sov":[{"name":"克潮靈","mentions":19,"share":0.35185185185185186,"is_target":true},{"name":"防潮家","mentions":15,"share":0.2777777777777778,"is_target":false},{"name":"國際牌","mentions":9,"share":0.16666666666666666,"is_target":false},{"name":"大金","mentions":8,"share":0.14814814814814814,"is_target":false},{"name":"金鳥","mentions":6,"share":0.1111111111111111,"is_target":false},{"name":"無印良品","mentions":6,"share":0.1111111111111111,"is_target":false},{"name":"順易利","mentions":6,"share":0.1111111111111111,"is_target":false},{"name":"日立","mentions":6,"share":0.1111111111111111,"is_target":false}],"by_cat":{"問題導向（不知品牌）":5.6,"品牌確認（聽過想確認）":100,"品類搜尋（不提品牌）":5.6},"prompts":[{"id":"prob-01","cat":"問題導向（不知品牌）","runs":[{"ri":0,"br":[{"r":1,"n":"白蘭","t":false},{"r":2,"n":"毛寶","t":false},{"r":3,"n":"CARBONA","t":false},{"r":4,"n":"防潮家","t":false},{"r":5,"n":"HAKUGEN白元","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[{"r":1,"n":"白蘭氏氧淨","t":false},{"r":2,"n":"Panasonic F系列","t":false},{"r":3,"n":"SHARP除濕機","t":false},{"r":4,"n":"白元防霉片","t":false},{"r":5,"n":"白元防霉噴霧","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[{"r":1,"n":"白蘭氏","t":false},{"r":2,"n":"威猛先生","t":false},{"r":3,"n":"UYEKI","t":false},{"r":4,"n":"花王Attack","t":false},{"r":5,"n":"日本雞仔牌","t":false}],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"prob-02","cat":"問題導向（不知品牌）","runs":[{"ri":0,"br":[{"r":1,"n":"強力吸濕哥","t":false},{"r":2,"n":"Carbona","t":false},{"r":3,"n":"Panasonic","t":false},{"r":4,"n":"SHARP","t":false},{"r":5,"n":"白元","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[{"r":1,"n":"強力吸濕達人","t":false},{"r":2,"n":"防潮家","t":false},{"r":3,"n":"Panasonic","t":false},{"r":4,"n":"SHARP","t":false},{"r":5,"n":"IKEA","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[{"r":1,"n":"台塑生醫","t":false},{"r":2,"n":"花仙子","t":true}],"tm":true,"tr":2,"ts":"positive"}]},{"id":"prob-03","cat":"問題導向（不知品牌）","runs":[{"ri":0,"br":[{"r":1,"n":"防潮家","t":false},{"r":2,"n":"金德恩","t":false},{"r":3,"n":"南投竹炭王","t":false},{"r":4,"n":"國際牌 Panasonic","t":false},{"r":5,"n":"大金 Daikin","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[{"r":1,"n":"金鳥","t":false},{"r":2,"n":"防潮家","t":true},{"r":3,"n":"IKEA","t":false},{"r":4,"n":"Panasonic","t":false},{"r":5,"n":"國際牌","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[{"r":1,"n":"防潮家","t":false},{"r":2,"n":"金德恩","t":false},{"r":3,"n":"大創","t":false}],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"prob-04","cat":"問題導向（不知品牌）","runs":[{"ri":0,"br":[{"r":1,"n":"LV","t":false},{"r":2,"n":"Chanel","t":false},{"r":3,"n":"Tarrago","t":false},{"r":4,"n":"Saphir","t":false},{"r":5,"n":"防潮家","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[{"r":1,"n":"LV","t":false},{"r":2,"n":"Chanel","t":false},{"r":3,"n":"Hermès","t":false},{"r":4,"n":"收藏家","t":false},{"r":5,"n":"Ruggard","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[{"r":1,"n":"Saphir（莎菲爾）","t":false},{"r":2,"n":"Collonil","t":false},{"r":3,"n":"奧斯卡皮件修復","t":false},{"r":4,"n":"收藏家","t":false},{"r":5,"n":"Wonderful","t":false}],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"prob-05","cat":"問題導向（不知品牌）","runs":[{"ri":0,"br":[{"r":1,"n":"防潮達人","t":false},{"r":2,"n":"金鳥","t":false},{"r":3,"n":"順易利","t":false},{"r":4,"n":"白博士","t":false},{"r":5,"n":"Dyson","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[{"r":1,"n":"防潮先生","t":false},{"r":2,"n":"金鳥","t":false},{"r":3,"n":"順易利","t":false},{"r":4,"n":"金鳥防霉片","t":false},{"r":5,"n":"白博士","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[{"r":1,"n":"防潮達人","t":false},{"r":2,"n":"金鳥","t":false},{"r":3,"n":"順易利","t":false},{"r":4,"n":"IKEA","t":false},{"r":5,"n":"國際牌","t":false}],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"prob-06","cat":"問題導向（不知品牌）","runs":[{"ri":0,"br":[{"r":1,"n":"樂扣樂扣","t":false},{"r":2,"n":"IKEA SAMLA","t":false},{"r":3,"n":"WD-40","t":false},{"r":4,"n":"國際牌","t":false},{"r":5,"n":"日立","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[{"r":1,"n":"IKEA SAMLA","t":false},{"r":2,"n":"防潮家 (Forsafe)","t":false},{"r":3,"n":"收藏家 (Collector)","t":false},{"r":4,"n":"國際牌 Panasonic","t":false},{"r":5,"n":"大金 Daikin","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[{"r":1,"n":"Panasonic","t":false},{"r":2,"n":"大金","t":false},{"r":3,"n":"收藏家","t":false},{"r":4,"n":"Wonderful","t":false},{"r":5,"n":"好市多","t":false}],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"brand-01","cat":"品牌確認（聽過想確認）","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"國際牌","t":false},{"r":3,"n":"大金","t":false},{"r":4,"n":"日立","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"國際牌","t":false},{"r":3,"n":"日立","t":false},{"r":4,"n":"三菱","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"國際牌","t":false},{"r":3,"n":"大金","t":false},{"r":4,"n":"日立","t":false}],"tm":true,"tr":1,"ts":"positive"}]},{"id":"brand-02","cat":"品牌確認（聽過想確認）","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"}]},{"id":"brand-03","cat":"品牌確認（聽過想確認）","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"除濕大師","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"除濕大師","t":false},{"r":3,"n":"國際牌","t":false},{"r":4,"n":"大金","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"除濕大師","t":false},{"r":3,"n":"國際牌","t":false},{"r":4,"n":"大金","t":false}],"tm":true,"tr":1,"ts":"positive"}]},{"id":"brand-04","cat":"品牌確認（聽過想確認）","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"neutral"}]},{"id":"brand-05","cat":"品牌確認（聽過想確認）","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"}]},{"id":"brand-06","cat":"品牌確認（聽過想確認）","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"neutral"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"neutral"},{"ri":2,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"電動除濕機","t":false}],"tm":true,"tr":1,"ts":"neutral"}]},{"id":"cat-01","cat":"品類搜尋（不提品牌）","runs":[{"ri":0,"br":[{"r":1,"n":"強力吸水屋","t":false},{"r":2,"n":"MUJI 無印良品","t":false},{"r":3,"n":"小林製藥","t":false},{"r":4,"n":"水鹿","t":false},{"r":5,"n":"Costco","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[{"r":1,"n":"Carbona","t":false},{"r":2,"n":"MUJI 無印良品","t":false},{"r":3,"n":"水鹿","t":false},{"r":4,"n":"Thirsty Hippo（飢渴河馬）","t":false},{"r":5,"n":"白元","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[{"r":1,"n":"強力吸水王","t":false},{"r":2,"n":"Thirsty Hippo（飢渴河馬）","t":false},{"r":3,"n":"MUJI 無印良品","t":false},{"r":4,"n":"小林製藥","t":false},{"r":5,"n":"防潮家","t":false}],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"cat-02","cat":"品類搜尋（不提品牌）","runs":[{"ri":0,"br":[{"r":1,"n":"水玻璃（Silica Gel）","t":false},{"r":2,"n":"MUJI 無印良品","t":false},{"r":3,"n":"魔術靈","t":false},{"r":4,"n":"金鳥","t":false},{"r":5,"n":"Carrefour自有品牌","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[{"r":1,"n":"水玻璃（Silica Gel）系列","t":false},{"r":2,"n":"小久保（Kokubo）","t":false},{"r":3,"n":"白元（Hakugen）","t":false},{"r":4,"n":"Carrefour 自有品牌","t":false},{"r":5,"n":"好市多自有品牌","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[{"r":1,"n":"水玻璃（Silica Gel）系列","t":false},{"r":2,"n":"Thirsty Hippo（飢渴河馬）","t":false},{"r":3,"n":"防潮家","t":false},{"r":4,"n":"MUJI（無印良品）","t":false}],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"cat-03","cat":"品類搜尋（不提品牌）","runs":[{"ri":0,"br":[{"r":1,"n":"妙管家","t":false},{"r":2,"n":"MUJI（無印良品）","t":false},{"r":3,"n":"小久保（KOKUBO）","t":false},{"r":4,"n":"水玻璃","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[{"r":1,"n":"白元/Hakugen","t":false},{"r":2,"n":"水玻璃","t":false},{"r":3,"n":"除濕小達人","t":false},{"r":4,"n":"小久保/Kokubo","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[{"r":1,"n":"強力吸水屋（Thirsty Hippo）","t":false},{"r":2,"n":"水玻璃","t":false},{"r":3,"n":"除濕小達人","t":false},{"r":4,"n":"克潮靈","t":true}],"tm":true,"tr":4,"ts":"neutral"}]},{"id":"cat-04","cat":"品類搜尋（不提品牌）","runs":[{"ri":0,"br":[{"r":1,"n":"金鳥（KINCHO）","t":false},{"r":2,"n":"防潮先生","t":false},{"r":3,"n":"白元","t":false},{"r":4,"n":"Eva-dry","t":false},{"r":5,"n":"無印良品","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[{"r":1,"n":"防潮家","t":false},{"r":2,"n":"無印良品","t":false},{"r":3,"n":"Thirsty Hippo（大眼蛙）","t":false},{"r":4,"n":"魔乾","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[{"r":1,"n":"防潮家","t":false},{"r":2,"n":"順易利","t":false},{"r":3,"n":"白元","t":false},{"r":4,"n":"PINOLE","t":false},{"r":5,"n":"無印良品","t":false}],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"cat-05","cat":"品類搜尋（不提品牌）","runs":[{"ri":0,"br":[{"r":1,"n":"強力除濕哥（OSAMA）","t":false},{"r":2,"n":"妙管家","t":false},{"r":3,"n":"無印良品","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[{"r":1,"n":"強力除濕盒（一般量販店款）","t":false},{"r":2,"n":"Thirsty Hippo 水呼吸","t":false},{"r":3,"n":"防潮家","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[{"r":1,"n":"防潮家","t":false},{"r":2,"n":"Thirsty Hippo（大嘴鳥）","t":false},{"r":3,"n":"金鳥","t":false}],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"cat-06","cat":"品類搜尋（不提品牌）","runs":[{"ri":0,"br":[{"r":1,"n":"國際牌 Panasonic","t":false},{"r":2,"n":"三菱 Mitsubishi","t":false},{"r":3,"n":"大金 DAIKIN","t":false},{"r":4,"n":"聲寶 SAMPO","t":false},{"r":5,"n":"KINYO","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[{"r":1,"n":"國際牌 Panasonic","t":false},{"r":2,"n":"三菱","t":false},{"r":3,"n":"大金 DAIKIN","t":false},{"r":4,"n":"聲寶 SAMPO","t":false},{"r":5,"n":"防潮家","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[{"r":1,"n":"Panasonic 國際牌","t":false},{"r":2,"n":"大金 DAIKIN","t":false},{"r":3,"n":"Frigidaire 富及第","t":false},{"r":4,"n":"MUJI 無印良品","t":false},{"r":5,"n":"順易利","t":false}],"tm":false,"tr":null,"ts":"not_applicable"}]}]},"perplexity":{"mention_rate":48.1,"avg_position":1,"sentiment":{"positive":22,"neutral":4,"negative":0},"sov":[{"name":"克潮靈","mentions":25,"share":0.46296296296296297,"is_target":true},{"name":"妙管家","mentions":6,"share":0.1111111111111111,"is_target":false},{"name":"ST雞仔牌","mentions":4,"share":0.07407407407407407,"is_target":false},{"name":"花兒香","mentions":4,"share":0.07407407407407407,"is_target":false},{"name":"除濕大師","mentions":3,"share":0.05555555555555555,"is_target":false},{"name":"白元","mentions":3,"share":0.05555555555555555,"is_target":false},{"name":"日本 ST 雞仔牌","mentions":3,"share":0.05555555555555555,"is_target":false},{"name":"EMO","mentions":3,"share":0.05555555555555555,"is_target":false}],"by_cat":{"問題導向（不知品牌）":0,"品牌確認（聽過想確認）":94.4,"品類搜尋（不提品牌）":50.0},"prompts":[{"id":"prob-01","cat":"問題導向（不知品牌）","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"prob-02","cat":"問題導向（不知品牌）","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"prob-03","cat":"問題導向（不知品牌）","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[{"r":1,"n":"炭八","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"prob-04","cat":"問題導向（不知品牌）","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"prob-05","cat":"問題導向（不知品牌）","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"prob-06","cat":"問題導向（不知品牌）","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"brand-01","cat":"品牌確認（聽過想確認）","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"}]},{"id":"brand-02","cat":"品牌確認（聽過想確認）","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"}]},{"id":"brand-03","cat":"品牌確認（聽過想確認）","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"除濕大師","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"除濕大師","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"除濕大師","t":false},{"r":2,"n":"克潮靈","t":true}],"tm":true,"tr":2,"ts":"neutral"}]},{"id":"brand-04","cat":"品牌確認（聽過想確認）","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"brand-05","cat":"品牌確認（聽過想確認）","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"}]},{"id":"brand-06","cat":"品牌確認（聽過想確認）","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"neutral"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"neutral"},{"ri":2,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"neutral"}]},{"id":"cat-01","cat":"品類搜尋（不提品牌）","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"白元","t":false},{"r":3,"n":"ST雞仔牌","t":false},{"r":4,"n":"妙管家","t":false},{"r":5,"n":"UdiLife","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"白元","t":false},{"r":3,"n":"ST雞仔牌","t":false},{"r":4,"n":"妙管家","t":false},{"r":5,"n":"花兒香","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"白元","t":false},{"r":3,"n":"ST雞仔牌","t":false},{"r":4,"n":"妙管家","t":false},{"r":5,"n":"UdiLife","t":false}],"tm":true,"tr":1,"ts":"positive"}]},{"id":"cat-02","cat":"品類搜尋（不提品牌）","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"日本 ST 雞仔牌","t":false},{"r":3,"n":"kokubo","t":false},{"r":4,"n":"EMO","t":false},{"r":5,"n":"花兒香","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"ST雞仔牌","t":false},{"r":3,"n":"kokubo","t":false},{"r":4,"n":"EMO","t":false},{"r":5,"n":"花兒香","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"特力屋 Very","t":false}],"tm":true,"tr":1,"ts":"positive"}]},{"id":"cat-03","cat":"品類搜尋（不提品牌）","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈／花仙子","t":true},{"r":2,"n":"妙管家","t":false},{"r":3,"n":"ST 雞仔牌","t":false},{"r":4,"n":"EMO","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"妙管家","t":false},{"r":3,"n":"日本 ST 雞仔牌","t":false},{"r":4,"n":"白元 / CONECO","t":false},{"r":5,"n":"ABSODRY","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"妙管家","t":false},{"r":3,"n":"日本 ST 雞仔牌","t":false}],"tm":true,"tr":1,"ts":"positive"}]},{"id":"cat-04","cat":"品類搜尋（不提品牌）","runs":[{"ri":0,"br":[{"r":1,"n":"SANSUI 山水","t":false},{"r":2,"n":"乾乾好 Absodry","t":false},{"r":3,"n":"GW 水玻璃","t":false},{"r":4,"n":"COMET","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[{"r":1,"n":"SANSUI 山水","t":false},{"r":2,"n":"GW 水玻璃","t":false},{"r":3,"n":"Absodry","t":false},{"r":4,"n":"COMET","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[{"r":1,"n":"Absodry","t":false},{"r":2,"n":"GW","t":false},{"r":3,"n":"SANSUI 山水","t":false}],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"cat-05","cat":"品類搜尋（不提品牌）","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"cat-06","cat":"品類搜尋（不提品牌）","runs":[{"ri":0,"br":[{"r":1,"n":"Whirlpool 惠而浦","t":false},{"r":2,"n":"HITACHI 日立","t":false},{"r":3,"n":"SHARP 夏普","t":false},{"r":4,"n":"PHILIPS 飛利浦","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[{"r":1,"n":"飛利浦 (PHILIPS)","t":false},{"r":2,"n":"LG","t":false},{"r":3,"n":"Panasonic","t":false},{"r":4,"n":"Whirlpool 惠而浦","t":false},{"r":5,"n":"三菱電機","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[{"r":1,"n":"小米","t":false},{"r":2,"n":"LG","t":false},{"r":3,"n":"PHILIPS","t":false},{"r":4,"n":"Whirlpool 惠而浦","t":false}],"tm":false,"tr":null,"ts":"not_applicable"}]}]}};

const SCAN_DATA_V4 = {"perplexity":{"mention_rate":25,"avg_position":1,"sentiment":{"positive":15,"neutral":3,"negative":0},"sov":[{"name":"克潮靈","mentions":18,"share":0.25,"is_target":true},{"name":"水玻璃","mentions":7,"share":0.09722222222222222,"is_target":false},{"name":"花仙子","mentions":4,"share":0.05555555555555555,"is_target":true},{"name":"ST雞仔牌","mentions":3,"share":0.041666666666666664,"is_target":false},{"name":"康朵","mentions":3,"share":0.041666666666666664,"is_target":false},{"name":"LG PuriCare","mentions":2,"share":0.027777777777777776,"is_target":false},{"name":"WINIX","mentions":1,"share":0.013888888888888888,"is_target":false},{"name":"國際牌","mentions":1,"share":0.013888888888888888,"is_target":false},{"name":"日立","mentions":1,"share":0.013888888888888888,"is_target":false},{"name":"防御工事","mentions":1,"share":0.013888888888888888,"is_target":false},{"name":"山水小綠能除濕器 SDR-120","mentions":1,"share":0.013888888888888888,"is_target":false},{"name":"防御工事小窩環保除濕乾燥盒","mentions":1,"share":0.013888888888888888,"is_target":false},{"name":"花兒香","mentions":1,"share":0.013888888888888888,"is_target":false},{"name":"SGS","mentions":1,"share":0.013888888888888888,"is_target":false},{"name":"3M","mentions":1,"share":0.013888888888888888,"is_target":false},{"name":"博客來","mentions":1,"share":0.013888888888888888,"is_target":false}],"by_cat":{"軸一：搜尋競爭密度控制":0,"軸二：內容格式信號":16.7,"軸三：同主題梯度測試":33.3,"軸四：排除式引導":50.0},"prompts":[{"id":"niche-01","cat":"軸一：搜尋競爭密度控制","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"niche-02","cat":"軸一：搜尋競爭密度控制","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"niche-03","cat":"軸一：搜尋競爭密度控制","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"niche-04","cat":"軸一：搜尋競爭密度控制","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"niche-05","cat":"軸一：搜尋競爭密度控制","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"niche-06","cat":"軸一：搜尋競爭密度控制","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"ugc-01","cat":"軸二：內容格式信號","runs":[{"ri":0,"br":[{"r":1,"n":"LG PuriCare","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[{"r":1,"n":"水玻璃","t":false},{"r":2,"n":"LG PuriCare","t":false},{"r":3,"n":"WINIX","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[{"r":1,"n":"國際牌","t":false},{"r":2,"n":"日立","t":false}],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"ugc-02","cat":"軸二：內容格式信號","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"ugc-03","cat":"軸二：內容格式信號","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"}]},{"id":"ugc-04","cat":"軸二：內容格式信號","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"ugc-05","cat":"軸二：內容格式信號","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[{"r":1,"n":"水玻璃","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[{"r":1,"n":"水玻璃","t":false}],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"ugc-06","cat":"軸二：內容格式信號","runs":[{"ri":0,"br":[{"r":1,"n":"水玻璃","t":false},{"r":2,"n":"防御工事","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[{"r":1,"n":"水玻璃","t":false},{"r":2,"n":"山水小綠能除濕器 SDR-120","t":false},{"r":3,"n":"防御工事小窩環保除濕乾燥盒","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[{"r":1,"n":"水玻璃","t":false}],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"grad-01","cat":"軸三：同主題梯度測試","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"grad-02","cat":"軸三：同主題梯度測試","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"ST雞仔牌","t":false},{"r":3,"n":"康朵","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"ST雞仔牌","t":false},{"r":3,"n":"康朵","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"ST雞仔牌","t":false},{"r":3,"n":"康朵","t":false}],"tm":true,"tr":1,"ts":"positive"}]},{"id":"grad-03","cat":"軸三：同主題梯度測試","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"花仙子","t":true},{"r":3,"n":"花兒香","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"花仙子","t":true},{"r":3,"n":"SGS","t":false}],"tm":true,"tr":1,"ts":"positive"}]},{"id":"grad-04","cat":"軸三：同主題梯度測試","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"grad-05","cat":"軸三：同主題梯度測試","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[{"r":1,"n":"水玻璃","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"grad-06","cat":"軸三：同主題梯度測試","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"excl-01","cat":"軸四：排除式引導","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"neutral"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"3M","t":false}],"tm":true,"tr":1,"ts":"neutral"},{"ri":2,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"neutral"}]},{"id":"excl-02","cat":"軸四：排除式引導","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"excl-03","cat":"軸四：排除式引導","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"excl-04","cat":"軸四：排除式引導","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"excl-05","cat":"軸四：排除式引導","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"花仙子","t":true},{"r":3,"n":"博客來","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"}]},{"id":"excl-06","cat":"軸四：排除式引導","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"花仙子","t":true}],"tm":true,"tr":1,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"}]}]},"gemini":{"mention_rate":40.8,"avg_position":1.4,"sentiment":{"positive":28,"neutral":1,"negative":0},"sov":[{"name":"克潮靈","mentions":27,"share":0.38028169014084506,"is_target":true},{"name":"水玻璃","mentions":12,"share":0.16901408450704225,"is_target":false},{"name":"防潮家","mentions":8,"share":0.11267605633802817,"is_target":false},{"name":"收藏家","mentions":8,"share":0.11267605633802817,"is_target":false},{"name":"ST雞仔牌","mentions":7,"share":0.09859154929577464,"is_target":false},{"name":"Panasonic","mentions":5,"share":0.07042253521126761,"is_target":false},{"name":"LG","mentions":5,"share":0.07042253521126761,"is_target":false},{"name":"妙管家","mentions":5,"share":0.07042253521126761,"is_target":false},{"name":"日立","mentions":4,"share":0.056338028169014086,"is_target":false},{"name":"SANSUI山水","mentions":4,"share":0.056338028169014086,"is_target":false},{"name":"Panasonic 國際牌","mentions":3,"share":0.04225352112676056,"is_target":false},{"name":"HITACHI 日立","mentions":3,"share":0.04225352112676056,"is_target":false},{"name":"花兒香","mentions":3,"share":0.04225352112676056,"is_target":false},{"name":"EMO","mentions":3,"share":0.04225352112676056,"is_target":false},{"name":"白元","mentions":3,"share":0.04225352112676056,"is_target":false},{"name":"惠而浦","mentions":3,"share":0.04225352112676056,"is_target":false},{"name":"三菱","mentions":3,"share":0.04225352112676056,"is_target":false},{"name":"威技 (NWT)","mentions":2,"share":0.028169014084507043,"is_target":false},{"name":"LG 樂金","mentions":2,"share":0.028169014084507043,"is_target":false},{"name":"Whirlpool 惠而浦","mentions":2,"share":0.028169014084507043,"is_target":false},{"name":"MITSUBISHI 三菱","mentions":2,"share":0.028169014084507043,"is_target":false},{"name":"康朵","mentions":2,"share":0.028169014084507043,"is_target":false},{"name":"mybest","mentions":2,"share":0.028169014084507043,"is_target":false},{"name":"Unipapa","mentions":2,"share":0.028169014084507043,"is_target":false},{"name":"花仙子","mentions":2,"share":0.028169014084507043,"is_target":true},{"name":"SGS","mentions":2,"share":0.028169014084507043,"is_target":false},{"name":"KOKUBO小久保","mentions":2,"share":0.028169014084507043,"is_target":false},{"name":"GREENON橘能國際","mentions":2,"share":0.028169014084507043,"is_target":false},{"name":"飛利浦","mentions":2,"share":0.028169014084507043,"is_target":false},{"name":"國際牌","mentions":2,"share":0.028169014084507043,"is_target":false},{"name":"夏普","mentions":2,"share":0.028169014084507043,"is_target":false},{"name":"SHARP 夏普","mentions":2,"share":0.028169014084507043,"is_target":false},{"name":"Honeywell","mentions":2,"share":0.028169014084507043,"is_target":false},{"name":"收藏家 (Collectioner)","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"防潮家 (Dry-Cabi)","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"無印良品","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"百鈴一碳究淨","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"居物社","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"furzapper","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"IKEA","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"QIDINA","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"Hitachi","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"Mitsubishi Electric","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"炭八","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"聯府KEYWAY","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"POKA","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"日立 (HITACHI)","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"樂金 (LG PuriCare)","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"國際牌 (Panasonic)","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"惠而浦 (Whirlpool)","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"小米 (Xiaomi)","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"伊萊克斯 (Electrolux)","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"Hysure 海說","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"THOMSON 檔潮王","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"MURA 永恆箱","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"皂福","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"TVBS新聞網","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"遠傳電信FETnet","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"信義居家","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"幸福空間","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"奇點空間設計","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"設計家 Searchome","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"小植淨","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"東隆電器","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"Women's Health","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"Unipapa Loop","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"山水小綠能","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"GW","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"大埔竹炭","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"備長炭防潮脫臭除濕包","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"水玻璃 (GW水玻璃)","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"收藏家 (PAKT)","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"Hidoo","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"Panasonic (國際牌)","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"Hitachi (日立)","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"Mitsubishi Electric (三菱電機)","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"小久保 (KOKUBO)","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"小久保","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"Mirai 日本Rainbow 彩虹未來","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"喵汪森林","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"PChome 24h購物","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"momo購物網","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"Moso Natural","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"PureGuardian","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"Green Piece","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"克潮靈 (Farcent)","mentions":1,"share":0.014084507042253521,"is_target":true},{"name":"花兒香 (花仙子旗下品牌)","mentions":1,"share":0.014084507042253521,"is_target":true},{"name":"特力屋","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"全聯","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"Yahoo購物中心","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"屈臣氏","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"酷澎","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"PChome 24h","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"Momo購物網","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"蝦皮購物","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"宜得利","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"挪威森林","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"白元 (Hakugen)","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"GW水玻璃","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"克潮靈（花仙子）","mentions":1,"share":0.014084507042253521,"is_target":true},{"name":"KANDO","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"水玻璃（GW）","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"SHOESMART","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"乾燥王","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"NPG","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"EMO除濕王","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"TAILI太力","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"Panasonic（國際牌）","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"日立（HITACHI）","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"LG（樂金）","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"三菱（MITSUBISHI）","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"飛利浦（PHILIPS）","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"夏普（SHARP）","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"惠而浦（Whirlpool）","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"3M","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"威技","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"SHARP","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"MITSUBISHI","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"only","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"富及第","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"HITACHI","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"Philips","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"Whirlpool","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"大同","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"歌林","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"SAMPO聲寶","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"東元","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"伊萊克斯","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"LG PuriCare","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"小米","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"禾聯 HERAN","mentions":1,"share":0.014084507042253521,"is_target":false},{"name":"JOMALONE","mentions":1,"share":0.014084507042253521,"is_target":false}],"by_cat":{"軸一：搜尋競爭密度控制":16.7,"軸二：內容格式信號":29.4,"軸三：同主題梯度測試":66.7,"軸四：排除式引導":50.0},"prompts":[{"id":"niche-01","cat":"軸一：搜尋競爭密度控制","runs":[{"ri":0,"br":[{"r":1,"n":"水玻璃","t":false},{"r":2,"n":"收藏家 (Collectioner)","t":false},{"r":3,"n":"防潮家 (Dry-Cabi)","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[{"r":1,"n":"水玻璃","t":false},{"r":2,"n":"克潮靈","t":true}],"tm":true,"tr":2,"ts":"neutral"}]},{"id":"niche-02","cat":"軸一：搜尋競爭密度控制","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"niche-03","cat":"軸一：搜尋競爭密度控制","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"無印良品","t":false},{"r":3,"n":"百鈴一碳究淨","t":false},{"r":4,"n":"居物社","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"furzapper","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[{"r":1,"n":"IKEA","t":false},{"r":2,"n":"QIDINA","t":false}],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"niche-04","cat":"軸一：搜尋競爭密度控制","runs":[{"ri":0,"br":[{"r":1,"n":"水玻璃","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[{"r":1,"n":"Panasonic","t":false},{"r":2,"n":"Hitachi","t":false},{"r":3,"n":"Mitsubishi Electric","t":false},{"r":4,"n":"LG","t":false},{"r":5,"n":"水玻璃","t":false},{"r":6,"n":"克潮靈","t":true},{"r":7,"n":"妙管家","t":false},{"r":8,"n":"防潮家","t":false},{"r":9,"n":"收藏家","t":false}],"tm":true,"tr":6,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"水玻璃","t":false},{"r":2,"n":"防潮家","t":false},{"r":3,"n":"收藏家","t":false}],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"niche-05","cat":"軸一：搜尋競爭密度控制","runs":[{"ri":0,"br":[{"r":1,"n":"水玻璃","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[{"r":1,"n":"炭八","t":false}],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"niche-06","cat":"軸一：搜尋競爭密度控制","runs":[{"ri":0,"br":[{"r":1,"n":"聯府KEYWAY","t":false},{"r":2,"n":"POKA","t":false},{"r":3,"n":"防潮家","t":false},{"r":4,"n":"收藏家","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[{"r":1,"n":"防潮家","t":false},{"r":2,"n":"收藏家","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"ugc-01","cat":"軸二：內容格式信號","runs":[{"ri":0,"br":[{"r":1,"n":"日立 (HITACHI)","t":false},{"r":2,"n":"樂金 (LG PuriCare)","t":false},{"r":3,"n":"國際牌 (Panasonic)","t":false},{"r":4,"n":"惠而浦 (Whirlpool)","t":false},{"r":5,"n":"小米 (Xiaomi)","t":false},{"r":6,"n":"伊萊克斯 (Electrolux)","t":false},{"r":7,"n":"威技 (NWT)","t":false},{"r":8,"n":"Hysure 海說","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[{"r":1,"n":"Panasonic 國際牌","t":false},{"r":2,"n":"LG 樂金","t":false},{"r":3,"n":"HITACHI 日立","t":false},{"r":4,"n":"Whirlpool 惠而浦","t":false},{"r":5,"n":"MITSUBISHI 三菱","t":false},{"r":6,"n":"威技 (NWT)","t":false},{"r":7,"n":"THOMSON 檔潮王","t":false},{"r":8,"n":"防潮家","t":false},{"r":9,"n":"MURA 永恆箱","t":false}],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"ugc-02","cat":"軸二：內容格式信號","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[{"r":1,"n":"水玻璃","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"ugc-03","cat":"軸二：內容格式信號","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"}]},{"id":"ugc-04","cat":"軸二：內容格式信號","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[{"r":1,"n":"水玻璃","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"ST雞仔牌","t":true},{"r":3,"n":"康朵","t":false},{"r":4,"n":"花兒香","t":false},{"r":5,"n":"皂福","t":false}],"tm":true,"tr":1,"ts":"positive"}]},{"id":"ugc-05","cat":"軸二：內容格式信號","runs":[{"ri":0,"br":[{"r":1,"n":"mybest","t":false},{"r":2,"n":"防潮家","t":false},{"r":3,"n":"收藏家","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[{"r":1,"n":"mybest","t":false},{"r":2,"n":"LG","t":false},{"r":3,"n":"日立","t":false},{"r":4,"n":"Panasonic","t":false},{"r":5,"n":"TVBS新聞網","t":false},{"r":6,"n":"遠傳電信FETnet","t":false},{"r":7,"n":"信義居家","t":false},{"r":8,"n":"幸福空間","t":false},{"r":9,"n":"奇點空間設計","t":false},{"r":10,"n":"設計家 Searchome","t":false},{"r":11,"n":"收藏家","t":false},{"r":12,"n":"小植淨","t":false},{"r":13,"n":"東隆電器","t":false},{"r":14,"n":"Women's Health","t":false}],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"ugc-06","cat":"軸二：內容格式信號","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"EMO","t":false},{"r":3,"n":"Unipapa Loop","t":false},{"r":4,"n":"山水小綠能","t":false},{"r":5,"n":"GW","t":false},{"r":6,"n":"大埔竹炭","t":false},{"r":7,"n":"備長炭防潮脫臭除濕包","t":false},{"r":8,"n":"水玻璃","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"水玻璃 (GW水玻璃)","t":false},{"r":2,"n":"SANSUI山水","t":false},{"r":3,"n":"Unipapa","t":false},{"r":4,"n":"ST雞仔牌","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[{"r":1,"n":"水玻璃","t":false},{"r":2,"n":"SANSUI山水","t":false}],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"grad-01","cat":"軸三：同主題梯度測試","runs":[{"ri":0,"br":[{"r":1,"n":"ST雞仔牌","t":false},{"r":2,"n":"SANSUI山水","t":false},{"r":3,"n":"收藏家 (PAKT)","t":false},{"r":4,"n":"Hidoo","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"妙管家","t":false},{"r":3,"n":"水玻璃","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"Panasonic (國際牌)","t":false},{"r":2,"n":"Hitachi (日立)","t":false},{"r":3,"n":"Mitsubishi Electric (三菱電機)","t":false},{"r":4,"n":"克潮靈","t":true},{"r":5,"n":"妙管家","t":false}],"tm":true,"tr":4,"ts":"positive"}]},{"id":"grad-02","cat":"軸三：同主題梯度測試","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"ST雞仔牌","t":true},{"r":3,"n":"花仙子","t":true},{"r":4,"n":"EMO","t":false},{"r":5,"n":"康朵","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"小久保 (KOKUBO)","t":false},{"r":3,"n":"妙管家","t":false},{"r":4,"n":"白元","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"白元","t":true},{"r":3,"n":"小久保","t":false},{"r":4,"n":"花兒香","t":false},{"r":5,"n":"EMO","t":false}],"tm":true,"tr":1,"ts":"positive"}]},{"id":"grad-03","cat":"軸三：同主題梯度測試","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"Mirai 日本Rainbow 彩虹未來","t":false},{"r":3,"n":"喵汪森林","t":false},{"r":4,"n":"SGS","t":false},{"r":5,"n":"PChome 24h購物","t":false},{"r":6,"n":"momo購物網","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"花兒香","t":false},{"r":3,"n":"Moso Natural","t":false},{"r":4,"n":"PureGuardian","t":false},{"r":5,"n":"Green Piece","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"克潮靈 (Farcent)","t":true},{"r":2,"n":"花兒香 (花仙子旗下品牌)","t":false},{"r":3,"n":"花仙子","t":true},{"r":4,"n":"SGS","t":false},{"r":5,"n":"特力屋","t":false},{"r":6,"n":"全聯","t":false},{"r":7,"n":"Yahoo購物中心","t":false},{"r":8,"n":"屈臣氏","t":false},{"r":9,"n":"酷澎","t":false},{"r":10,"n":"PChome 24h","t":false},{"r":11,"n":"Momo購物網","t":false},{"r":12,"n":"蝦皮購物","t":false}],"tm":true,"tr":1,"ts":"positive"}]},{"id":"grad-04","cat":"軸三：同主題梯度測試","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[{"r":1,"n":"水玻璃","t":false},{"r":2,"n":"克潮靈","t":true}],"tm":true,"tr":2,"ts":"positive"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"grad-05","cat":"軸三：同主題梯度測試","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"ST雞仔牌","t":true},{"r":3,"n":"白元","t":true},{"r":4,"n":"宜得利","t":false},{"r":5,"n":"KOKUBO小久保","t":false},{"r":6,"n":"挪威森林","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"白元 (Hakugen)","t":false},{"r":2,"n":"ST雞仔牌","t":false},{"r":3,"n":"克潮靈","t":true},{"r":4,"n":"妙管家","t":false},{"r":5,"n":"GREENON橘能國際","t":false},{"r":6,"n":"GW水玻璃","t":false},{"r":7,"n":"Unipapa","t":false},{"r":8,"n":"KOKUBO小久保","t":false}],"tm":true,"tr":3,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"克潮靈（花仙子）","t":true},{"r":2,"n":"ST雞仔牌","t":false},{"r":3,"n":"KANDO","t":false},{"r":4,"n":"GREENON橘能國際","t":false},{"r":5,"n":"SANSUI山水","t":false},{"r":6,"n":"水玻璃（GW）","t":false},{"r":7,"n":"SHOESMART","t":false},{"r":8,"n":"乾燥王","t":false},{"r":9,"n":"NPG","t":false},{"r":10,"n":"EMO除濕王","t":false}],"tm":true,"tr":1,"ts":"positive"}]},{"id":"grad-06","cat":"軸三：同主題梯度測試","runs":[{"ri":0,"br":[{"r":1,"n":"TAILI太力","t":false},{"r":2,"n":"防潮家","t":false},{"r":3,"n":"收藏家","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[{"r":1,"n":"防潮家","t":false},{"r":2,"n":"收藏家","t":false}],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"excl-01","cat":"軸四：排除式引導","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"}]},{"id":"excl-02","cat":"軸四：排除式引導","runs":[{"ri":0,"br":[{"r":1,"n":"Panasonic（國際牌）","t":false},{"r":2,"n":"日立（HITACHI）","t":false},{"r":3,"n":"LG（樂金）","t":false},{"r":4,"n":"三菱（MITSUBISHI）","t":false},{"r":5,"n":"飛利浦（PHILIPS）","t":false},{"r":6,"n":"夏普（SHARP）","t":false},{"r":7,"n":"惠而浦（Whirlpool）","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[{"r":1,"n":"3M","t":false},{"r":2,"n":"威技","t":false},{"r":3,"n":"惠而浦","t":false},{"r":4,"n":"日立","t":false},{"r":5,"n":"飛利浦","t":false},{"r":6,"n":"LG","t":false},{"r":7,"n":"Panasonic","t":false},{"r":8,"n":"SHARP","t":false},{"r":9,"n":"MITSUBISHI","t":false},{"r":10,"n":"only","t":false},{"r":11,"n":"富及第","t":false},{"r":12,"n":"三菱","t":false},{"r":13,"n":"HITACHI","t":false},{"r":14,"n":"Philips","t":false},{"r":15,"n":"Whirlpool","t":false},{"r":16,"n":"大同","t":false},{"r":17,"n":"歌林","t":false},{"r":18,"n":"SAMPO聲寶","t":false},{"r":19,"n":"東元","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[{"r":1,"n":"LG","t":false},{"r":2,"n":"三菱","t":false},{"r":3,"n":"國際牌","t":false},{"r":4,"n":"日立","t":false},{"r":5,"n":"Panasonic","t":false},{"r":6,"n":"惠而浦","t":false},{"r":7,"n":"飛利浦","t":false},{"r":8,"n":"夏普","t":false}],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"excl-03","cat":"軸四：排除式引導","runs":[{"ri":0,"br":[{"r":1,"n":"Panasonic 國際牌","t":false},{"r":2,"n":"HITACHI 日立","t":false},{"r":3,"n":"LG 樂金","t":false},{"r":4,"n":"SHARP 夏普","t":false},{"r":5,"n":"MITSUBISHI 三菱","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[{"r":1,"n":"三菱","t":false},{"r":2,"n":"LG","t":false},{"r":3,"n":"國際牌","t":false},{"r":4,"n":"日立","t":false},{"r":5,"n":"Honeywell","t":false},{"r":6,"n":"伊萊克斯","t":false},{"r":7,"n":"Panasonic","t":false},{"r":8,"n":"惠而浦","t":false},{"r":9,"n":"夏普","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[{"r":1,"n":"Panasonic 國際牌","t":false},{"r":2,"n":"HITACHI 日立","t":false},{"r":3,"n":"LG PuriCare","t":false},{"r":4,"n":"Whirlpool 惠而浦","t":false},{"r":5,"n":"SHARP 夏普","t":false},{"r":6,"n":"小米","t":false},{"r":7,"n":"禾聯 HERAN","t":false},{"r":8,"n":"Honeywell","t":false}],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"excl-04","cat":"軸四：排除式引導","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"excl-05","cat":"軸四：排除式引導","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"}]},{"id":"excl-06","cat":"軸四：排除式引導","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"JOMALONE","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"}]}]}};

const SCAN_DATA_V5 = {"chatgpt":{"mention_rate":36.3,"avg_position":1.1,"sentiment":{"positive":24,"neutral":5,"negative":0},"sov":[{"name":"克潮靈","mentions":29,"share":0.3625,"is_target":true},{"name":"ST 雞仔牌","mentions":6,"share":0.075,"is_target":false},{"name":"花仙子","mentions":5,"share":0.0625,"is_target":true},{"name":"GW 水玻璃","mentions":5,"share":0.0625,"is_target":false},{"name":"M.MOWBRAY","mentions":5,"share":0.0625,"is_target":false},{"name":"Reddot 紅點生活","mentions":3,"share":0.0375,"is_target":false},{"name":"EMO 除濕王","mentions":3,"share":0.0375,"is_target":false},{"name":"日本 ST 雞仔牌","mentions":2,"share":0.025,"is_target":false},{"name":"妙管家","mentions":2,"share":0.025,"is_target":false},{"name":"皂福輕時代","mentions":2,"share":0.025,"is_target":false},{"name":"皂福","mentions":2,"share":0.025,"is_target":false},{"name":"日本ST雞仔牌","mentions":2,"share":0.025,"is_target":false},{"name":"ASTRO","mentions":2,"share":0.025,"is_target":false},{"name":"小久保 Kokubo","mentions":1,"share":0.0125,"is_target":false},{"name":"Mass 迷你可循環除濕器","mentions":1,"share":0.0125,"is_target":false}],"by_cat":{"品類關鍵字":87.5,"場景關鍵字":0,"品牌指名":100},"prompts":[{"id":"kw-01","cat":"品類關鍵字","runs":[{"ri":0,"br":[{"r":1,"n":"日本 ST 雞仔牌","t":false},{"r":2,"n":"小久保 Kokubo","t":false},{"r":3,"n":"Mass 迷你可循環除濕器","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"妙管家","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":3,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"DRY&DRY UP","t":false},{"r":3,"n":"ST 雞仔牌","t":false},{"r":4,"n":"Homeco","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":4,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"妙管家","t":false},{"r":3,"n":"收藏家","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":5,"br":[{"r":1,"n":"ST 雞仔牌","t":false},{"r":2,"n":"克潮靈","t":true},{"r":3,"n":"grantclassic 吸乾淨 CyPure","t":false},{"r":4,"n":"Reddot 紅點生活","t":false}],"tm":true,"tr":2,"ts":"positive"},{"ri":6,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"grantclassic 特經典 CyPure","t":false},{"r":3,"n":"Reddot 紅點生活","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":7,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"grantclassic 特經典 吸乾淨 Cypure","t":false},{"r":3,"n":"Reddot 紅點生活","t":false}],"tm":true,"tr":1,"ts":"positive"}]},{"id":"kw-02","cat":"品類關鍵字","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"花仙子","t":true},{"r":3,"n":"皂福輕時代","t":false},{"r":4,"n":"樂邦","t":false},{"r":5,"n":"無品牌現貨款","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"花仙子","t":true},{"r":3,"n":"皂福","t":false}],"tm":true,"tr":1,"ts":"neutral"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":3,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"positive"},{"ri":4,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"皂福 輕時代","t":false},{"r":3,"n":"日本ST雞仔牌","t":false},{"r":4,"n":"蝦皮各式無名/副牌款","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":5,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"ST雞仔牌","t":false},{"r":3,"n":"皂福輕時代","t":false},{"r":4,"n":"蝦皮通用款","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":6,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"日本ST雞仔牌","t":false},{"r":3,"n":"皂福","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":7,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"花兒香","t":false},{"r":3,"n":"日本 ST 雞仔牌","t":false},{"r":4,"n":"康朵","t":false},{"r":5,"n":"輕時代","t":false}],"tm":true,"tr":1,"ts":"positive"}]},{"id":"kw-03","cat":"品類關鍵字","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"EMO 除濕王","t":false},{"r":3,"n":"ASTRO","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"GW 水玻璃","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"ST 雞仔牌","t":false},{"r":3,"n":"M.MOWBRAY 莫布雷","t":false},{"r":4,"n":"EMO 除濕王","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":3,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"M.MOWBRAY","t":false},{"r":3,"n":"GW 水玻璃","t":false},{"r":4,"n":"ASTRO","t":false},{"r":5,"n":"Winix","t":false},{"r":6,"n":"日立","t":false},{"r":7,"n":"風倍清","t":false},{"r":8,"n":"木酢達人","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":4,"br":[{"r":1,"n":"GW 水玻璃","t":false},{"r":2,"n":"克潮靈","t":true},{"r":3,"n":"M.MOWBRAY","t":false},{"r":4,"n":"Karari","t":false},{"r":5,"n":"順風牌","t":false},{"r":6,"n":"unifun","t":false},{"r":7,"n":"SOTHING","t":false}],"tm":true,"tr":2,"ts":"positive"},{"ri":5,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"GW 水玻璃","t":false},{"r":3,"n":"M.MOWBRAY","t":false},{"r":4,"n":"ST 雞仔牌","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":6,"br":[{"r":1,"n":"PChome","t":false},{"r":2,"n":"蝦皮","t":false},{"r":3,"n":"克潮靈","t":true},{"r":4,"n":"M.MOWBRAY","t":false},{"r":5,"n":"ST 雞仔牌","t":false}],"tm":true,"tr":3,"ts":"positive"},{"ri":7,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"EMO 除濕王","t":false},{"r":3,"n":"GW 水玻璃","t":false},{"r":4,"n":"M.MOWBRAY","t":false},{"r":5,"n":"ST 雞仔牌","t":false}],"tm":true,"tr":1,"ts":"positive"}]},{"id":"kw-04","cat":"場景關鍵字","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":3,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":4,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":5,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":6,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":7,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"kw-05","cat":"場景關鍵字","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":3,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":4,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":5,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":6,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":7,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"kw-06","cat":"場景關鍵字","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":3,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":4,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":5,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":6,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":7,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"kw-07","cat":"場景關鍵字","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":3,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":4,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":5,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":6,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":7,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"kw-08","cat":"場景關鍵字","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":3,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":4,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":5,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":6,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":7,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"kw-09","cat":"場景關鍵字","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":3,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":4,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":5,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":6,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":7,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"kw-10","cat":"品牌指名","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"neutral"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"neutral"},{"ri":2,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"neutral"},{"ri":3,"br":[{"r":1,"n":"克潮靈","t":true}],"tm":true,"tr":1,"ts":"neutral"},{"ri":4,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"水玻璃","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":5,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"花仙子","t":true}],"tm":true,"tr":1,"ts":"positive"},{"ri":6,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"花仙子","t":true}],"tm":true,"tr":1,"ts":"positive"},{"ri":7,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"花仙子","t":true},{"r":3,"n":"全聯","t":false}],"tm":true,"tr":1,"ts":"positive"}]}]},"claude-search":{"mention_rate":37.5,"avg_position":2.3,"sentiment":{"positive":15,"neutral":0,"negative":0},"sov":[{"name":"ST 雞仔牌","mentions":9,"share":0.225,"is_target":false},{"name":"克潮靈","mentions":8,"share":0.2,"is_target":true},{"name":"PChome 24h","mentions":5,"share":0.125,"is_target":false},{"name":"克潮靈 (Farcent)","mentions":4,"share":0.1,"is_target":true},{"name":"Yahoo 購物中心","mentions":4,"share":0.1,"is_target":false},{"name":"DIKE","mentions":4,"share":0.1,"is_target":false},{"name":"KINYO","mentions":4,"share":0.1,"is_target":false},{"name":"花仙子","mentions":4,"share":0.1,"is_target":true},{"name":"SGS","mentions":4,"share":0.1,"is_target":false},{"name":"特力屋","mentions":4,"share":0.1,"is_target":false},{"name":"白元 (Hakugen)","mentions":3,"share":0.075,"is_target":false},{"name":"momo 購物網","mentions":3,"share":0.075,"is_target":false},{"name":"KOKUBO 小久保","mentions":3,"share":0.075,"is_target":false},{"name":"SOTHING 向物","mentions":3,"share":0.075,"is_target":false},{"name":"歌林","mentions":3,"share":0.075,"is_target":false}],"by_cat":{"品類關鍵字":91.7,"場景關鍵字":0,"品牌指名":100},"prompts":[{"id":"kw-01","cat":"品類關鍵字","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈 (Farcent)","t":true},{"r":2,"n":"白元 (Hakugen)","t":false},{"r":3,"n":"ST 雞仔牌 (ST)","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"ST 雞仔牌","t":false},{"r":3,"n":"白元","t":false},{"r":4,"n":"COGIT","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"克潮靈 (Farcent)","t":true},{"r":2,"n":"ST 雞仔牌","t":false},{"r":3,"n":"白元 (Hakugen)","t":false},{"r":4,"n":"寶雅 (POYA)","t":false},{"r":5,"n":"家樂福","t":false},{"r":6,"n":"momo 購物網","t":false},{"r":7,"n":"Yahoo 購物中心","t":false},{"r":8,"n":"PChome 24h","t":false},{"r":9,"n":"蝦皮購物","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":3,"br":[{"r":1,"n":"克潮靈 (Farcent)","t":true},{"r":2,"n":"白元 (Hakugen)","t":false},{"r":3,"n":"ST 雞仔牌","t":false}],"tm":true,"tr":1,"ts":"positive"}]},{"id":"kw-02","cat":"品類關鍵字","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈 (Farcent)","t":true},{"r":2,"n":"GW 水玻璃","t":false},{"r":3,"n":"KANDO","t":false},{"r":4,"n":"妙管家","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"GW 水玻璃","t":false},{"r":3,"n":"KANDO","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"克潮靈（花仙子）","t":true},{"r":2,"n":"ST 雞仔牌","t":false},{"r":3,"n":"KOKUBO 小久保","t":false},{"r":4,"n":"花太太","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":3,"br":[{"r":1,"n":"克潮靈（花仙子）","t":true},{"r":2,"n":"花兒香（花仙子）","t":true},{"r":3,"n":"禾統","t":false},{"r":4,"n":"ST 雞仔牌","t":false}],"tm":true,"tr":1,"ts":"positive"}]},{"id":"kw-03","cat":"品類關鍵字","runs":[{"ri":0,"br":[{"r":1,"n":"ST 雞仔牌","t":false},{"r":2,"n":"昊采家品","t":false},{"r":3,"n":"Gran's Remedy 紐西蘭老奶奶","t":false},{"r":4,"n":"愛咖 iFoot","t":false},{"r":5,"n":"LOHAS","t":false},{"r":6,"n":"SOTHING 向物","t":false},{"r":7,"n":"歌林","t":false},{"r":8,"n":"DIKE","t":false},{"r":9,"n":"KINYO","t":false},{"r":10,"n":"IRIS OHYAMA","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[{"r":1,"n":"ST 雞仔牌","t":false},{"r":2,"n":"白元","t":false},{"r":3,"n":"Gran's Remedy","t":false},{"r":4,"n":"KOKUBO 小久保","t":false},{"r":5,"n":"克潮靈","t":true},{"r":6,"n":"KINYO","t":false},{"r":7,"n":"DIKE","t":false},{"r":8,"n":"SOTHING 向物","t":false}],"tm":true,"tr":5,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"KINYO","t":false},{"r":2,"n":"IRIS OHYAMA","t":false},{"r":3,"n":"歌林","t":false},{"r":4,"n":"DIKE","t":false},{"r":5,"n":"SOTHING 向物","t":false},{"r":6,"n":"SHOESMART","t":false},{"r":7,"n":"ST 雞仔牌","t":false},{"r":8,"n":"Gran's Remedy","t":false},{"r":9,"n":"花仙子克潮靈","t":true}],"tm":true,"tr":9,"ts":"positive"},{"ri":3,"br":[{"r":1,"n":"KINYO","t":false},{"r":2,"n":"IRIS OHYAMA","t":false},{"r":3,"n":"歌林","t":false},{"r":4,"n":"SOTHING","t":false},{"r":5,"n":"DIKE","t":false},{"r":6,"n":"ST 雞仔牌","t":false},{"r":7,"n":"Gran's Remedy","t":false},{"r":8,"n":"KOKUBO 小久保","t":false},{"r":9,"n":"克潮靈","t":true},{"r":10,"n":"昊采","t":false},{"r":11,"n":"愛咖iFoot","t":false}],"tm":true,"tr":9,"ts":"positive"}]},{"id":"kw-04","cat":"場景關鍵字","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":3,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"kw-05","cat":"場景關鍵字","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":3,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"kw-06","cat":"場景關鍵字","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":3,"br":[{"r":1,"n":"LG (ThinQ)","t":false},{"r":2,"n":"小米 (米家)","t":false},{"r":3,"n":"日立","t":false},{"r":4,"n":"伊萊克斯","t":false}],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"kw-07","cat":"場景關鍵字","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[{"r":1,"n":"國際牌 Panasonic","t":false},{"r":2,"n":"日立 HITACHI","t":false},{"r":3,"n":"LG 樂金","t":false},{"r":4,"n":"夏普 SHARP","t":false},{"r":5,"n":"小米 Xiaomi","t":false}],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":3,"br":[{"r":1,"n":"國際牌","t":false},{"r":2,"n":"日立","t":false},{"r":3,"n":"LG PuriCare","t":false},{"r":4,"n":"夏普 SHARP","t":false},{"r":5,"n":"小米","t":false}],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"kw-08","cat":"場景關鍵字","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":3,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"kw-09","cat":"場景關鍵字","runs":[{"ri":0,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":1,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":2,"br":[],"tm":false,"tr":null,"ts":"not_applicable"},{"ri":3,"br":[],"tm":false,"tr":null,"ts":"not_applicable"}]},{"id":"kw-10","cat":"品牌指名","runs":[{"ri":0,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"花仙子","t":true},{"r":3,"n":"SGS","t":false},{"r":4,"n":"PChome 24h","t":false},{"r":5,"n":"Yahoo購物中心","t":false},{"r":6,"n":"特力屋","t":false},{"r":7,"n":"好市多 Costco","t":false},{"r":8,"n":"博客來","t":false},{"r":9,"n":"小北百貨","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":1,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"花仙子","t":true},{"r":3,"n":"PChome 24h","t":false},{"r":4,"n":"好市多 Costco","t":false},{"r":5,"n":"特力屋","t":false},{"r":6,"n":"Yahoo 購物中心","t":false},{"r":7,"n":"小北百貨","t":false},{"r":8,"n":"全聯","t":false},{"r":9,"n":"博客來","t":false},{"r":10,"n":"SGS","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":2,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"花仙子","t":true},{"r":3,"n":"PChome 24h","t":false},{"r":4,"n":"Yahoo 購物中心","t":false},{"r":5,"n":"momo 購物網","t":false},{"r":6,"n":"Costco","t":false},{"r":7,"n":"特力屋","t":false},{"r":8,"n":"POYA 寶雅","t":false},{"r":9,"n":"SGS","t":false}],"tm":true,"tr":1,"ts":"positive"},{"ri":3,"br":[{"r":1,"n":"克潮靈","t":true},{"r":2,"n":"花仙子","t":true},{"r":3,"n":"好市多 (Costco)","t":false},{"r":4,"n":"Yahoo 購物中心","t":false},{"r":5,"n":"PChome 24h","t":false},{"r":6,"n":"momo 購物網","t":false},{"r":7,"n":"全聯","t":false},{"r":8,"n":"寶雅 (POYA)","t":false},{"r":9,"n":"特力屋","t":false},{"r":10,"n":"小北百貨","t":false},{"r":11,"n":"SGS","t":false}],"tm":true,"tr":1,"ts":"positive"}]}]}};

// ─── Scan Sets (for dropdown) ───────────────────────
const SCAN_SETS = {
  "v4-all": {
    label: "v4 vocus 能見度 — Perplexity + Gemini",
    date: "2026-06-03",
    platforms: ["perplexity", "gemini"],
    version: "v4",
  },
  "v4-perplexity": {
    label: "v4 vocus 能見度 — Perplexity only",
    date: "2026-06-03",
    platforms: ["perplexity"],
    version: "v4",
  },
  "v4-gemini": {
    label: "v4 vocus 能見度 — Gemini only",
    date: "2026-06-03",
    platforms: ["gemini"],
    version: "v4",
  },
  "v3-all": {
    label: "v3 三層漏斗 — Claude + Perplexity",
    date: "2026-06-03",
    platforms: ["claude", "perplexity"],
    version: "v3",
  },
  "v3-claude": {
    label: "v3 三層漏斗 — Claude only",
    date: "2026-06-03",
    platforms: ["claude"],
    version: "v3",
  },
  "v3-perplexity": {
    label: "v3 三層漏斗 — Perplexity only",
    date: "2026-06-03",
    platforms: ["perplexity"],
    version: "v3",
  },
  "v5-all": {
    label: "v5 關鍵字策略 — ChatGPT + Claude Search",
    date: "2026-06-04",
    platforms: ["chatgpt", "claude-search"],
    version: "v5",
  },
  "v5-chatgpt": {
    label: "v5 關鍵字策略 — ChatGPT only (Bing)",
    date: "2026-06-04",
    platforms: ["chatgpt"],
    version: "v5",
  },
  "v5-claude-search": {
    label: "v5 關鍵字策略 — Claude Search only (Brave)",
    date: "2026-06-04",
    platforms: ["claude-search"],
    version: "v5",
  },
};

// ─── Build dashboard-compatible data from scan set ──
function buildDashboardData(scanSetId) {
  const scanSet = SCAN_SETS[scanSetId];
  const activePlatforms = scanSet.platforms;
  const SCAN_DATA = scanSet.version === "v5" ? SCAN_DATA_V5 : scanSet.version === "v4" ? SCAN_DATA_V4 : SCAN_DATA_V3;

  // Build platforms object
  const platforms = {};
  for (const pk of Object.keys(PLATFORMS)) {
    if (activePlatforms.includes(pk) && SCAN_DATA[pk]) {
      const s = SCAN_DATA[pk];
      const byCategory = {};
      for (const [catFull, rate] of Object.entries(s.by_cat)) {
        byCategory[catFull] = { rate };
      }
      platforms[pk] = {
        model: pk === "claude" ? "claude-sonnet-4-6" : pk === "claude-search" ? "claude-sonnet-4-6 + Brave" : pk === "chatgpt" ? "gpt-5.4-mini + Bing" : pk === "perplexity" ? "sonar" : pk === "gemini" ? "gemini-2.5-flash" : "待掃描",
        mention_rate: s.mention_rate,
        avg_position: s.avg_position,
        sentiment: s.sentiment,
        share_of_voice: s.sov,
        by_category: byCategory,
        prompts: s.prompts || [],
      };
    } else {
      platforms[pk] = {
        model: "待掃描",
        mention_rate: null,
        avg_position: null,
        sentiment: { positive: 0, neutral: 0, negative: 0 },
        share_of_voice: [],
        by_category: {},
        prompts: [],
      };
    }
  }

  // Build prompt_details (merged across platforms)
  const allPromptIds = SCAN_DATA[activePlatforms[0]]?.prompts.map(p => p.id) || [];
  const promptDetails = allPromptIds.map(pid => {
    const text = PROMPT_TEXTS[pid] || pid;
    const firstScan = SCAN_DATA[activePlatforms[0]]?.prompts.find(p => p.id === pid);
    const category = firstScan?.cat || "";

    // Per-platform run data
    const platformRuns = {};
    for (const pk of Object.keys(PLATFORMS)) {
      if (activePlatforms.includes(pk) && SCAN_DATA[pk]) {
        const pData = SCAN_DATA[pk].prompts.find(p => p.id === pid);
        platformRuns[pk] = pData?.runs || [];
      } else {
        platformRuns[pk] = null; // pending
      }
    }

    // Legacy results for backwards compat
    const results = {};
    for (const [pk, runs] of Object.entries(platformRuns)) {
      if (!runs) {
        results[pk] = { mentioned: null, position: null, sentiment: null };
      } else {
        const anyMentioned = runs.some(r => r.tm);
        const firstMentioned = runs.find(r => r.tm);
        results[pk] = {
          mentioned: anyMentioned ? true : false,
          position: firstMentioned?.tr || null,
          sentiment: firstMentioned?.ts || null,
        };
      }
    }

    return { id: pid, text, category, results, platformRuns };
  });

  // Historical (single point for now)
  const historical = [{
    date: scanSet.date.slice(5),
    ...Object.fromEntries(Object.keys(PLATFORMS).map(pk => [pk, platforms[pk].mention_rate])),
  }];

  return {
    brand: "克潮靈",
    scan_date: scanSet.date,
    platforms,
    prompt_details: promptDetails,
    historical,
    // Keep site_ai data as-is (demo)
    site_ai: SITE_AI_DATA,
  };
}

// ─── Site AI Data (demo, unchanged) ─────────────────
const SITE_AI_DATA = {
  period: "2026-05-01 ~ 2026-06-03",
  total_pv: 8420000,
  ai_referral_pv: 168400,
  ai_referral_pct: 2.0,
  ai_sources: [
    { source: "ChatGPT", pv: 72012, pct: 42.8, trend: "+18%", color: "#74aa9c" },
    { source: "Perplexity", pv: 40416, pct: 24.0, trend: "+35%", color: "#22d3ee" },
    { source: "Google AI Overview", pv: 30312, pct: 18.0, trend: "+52%", color: "#4285f4" },
    { source: "Gemini", pv: 13472, pct: 8.0, trend: "+12%", color: "#8ab4f8" },
    { source: "Claude", pv: 6736, pct: 4.0, trend: "+8%", color: "#d4a27a" },
    { source: "Others", pv: 5452, pct: 3.2, trend: "+5%", color: "#64748b" },
  ],
  ai_referral_trend: [
    { month: "2026-01", pv: 68000, pct: 0.9 },
    { month: "2026-02", pv: 89000, pct: 1.1 },
    { month: "2026-03", pv: 112000, pct: 1.4 },
    { month: "2026-04", pv: 138000, pct: 1.7 },
    { month: "2026-05", pv: 168400, pct: 2.0 },
  ],
  top_cited_articles: [
    { title: "2026 台灣內容創作者生態報告", author: "vocus 編輯部", pv_from_ai: 8420, sources: ["Perplexity", "ChatGPT"], campaign: null },
    { title: "訂閱制經營完全指南：從 0 到 1000 位付費讀者", author: "李明哲", pv_from_ai: 6230, sources: ["Perplexity", "Google AI Overview"], campaign: null },
    { title: "【合作】ASUS ZenBook 深度評測：創作者的日常夥伴", author: "科技島讀", pv_from_ai: 4150, sources: ["ChatGPT", "Perplexity"], campaign: "ASUS Q2 Campaign" },
    { title: "台灣精品咖啡地圖：北中南 30 家必訪", author: "咖啡因的地圖", pv_from_ai: 3820, sources: ["Perplexity", "Google AI Overview", "ChatGPT"], campaign: null },
    { title: "【合作】理膚寶水敏感肌保養實測 30 天", author: "美肌日記", pv_from_ai: 2940, sources: ["ChatGPT"], campaign: "La Roche-Posay Spring" },
  ],
  campaign_performance: [
    { campaign: "ASUS Q2 Campaign", brand: "ASUS", articles: 3, total_pv: 12800, ai_pv: 4150, ai_pct: 32.4, ai_sources: ["ChatGPT", "Perplexity"], status: "active" },
    { campaign: "La Roche-Posay Spring", brand: "理膚寶水", articles: 2, total_pv: 8600, ai_pv: 2940, ai_pct: 34.2, ai_sources: ["ChatGPT"], status: "active" },
    { campaign: "MUJI Living Campaign", brand: "MUJI", articles: 2, total_pv: 6200, ai_pv: 1950, ai_pct: 31.5, ai_sources: ["Google AI Overview"], status: "completed" },
  ],
};

// ─── Colors ──────────────────────────────────────────
const C = {
  bg: "#0a0e17", surface: "#111827", border: "#1e293b",
  text: "#e2e8f0", textMuted: "#94a3b8", textDim: "#64748b",
  brand: "#22d3ee", brandDim: "rgba(34,211,238,0.15)",
  green: "#34d399", greenDim: "rgba(52,211,153,0.15)",
  amber: "#fbbf24", amberDim: "rgba(251,191,36,0.15)",
  red: "#f87171", redDim: "rgba(248,113,113,0.15)",
  purple: "#a78bfa",
};

// ─── Helpers ─────────────────────────────────────────
function KPI({ label, value, sub, color = C.brand, icon }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>{icon} {label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color, lineHeight: 1.1, fontFamily: "monospace" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Section({ children, title }) {
  return (
    <div style={{ marginTop: 28 }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 12 }}>{title}</h2>
      {children}
    </div>
  );
}

function Badge({ children, color = C.brand }) {
  return <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 600, color, background: `${color}22` }}>{children}</span>;
}

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1e293b", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
      <div style={{ color: C.textMuted, marginBottom: 3 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>{p.name}: <strong>{typeof p.value === "number" ? Math.round(p.value * 10) / 10 : p.value}%</strong></div>
      ))}
    </div>
  );
};

// ─── Main ────────────────────────────────────────────
export default function AIODashboard() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [tab, setTab] = useState("overview");
  const [scanSetId, setScanSetId] = useState("v4-all");
  const PASS = "vocus2026";

  const d = useMemo(() => buildDashboardData(scanSetId), [scanSetId]);
  const platformKeys = Object.keys(d.platforms);

  const crossPlatform = platformKeys.map((k) => {
    const p = d.platforms[k];
    const allRuns = (p.prompts || []).flatMap(pr => pr.runs);
    const mentioned = allRuns.filter(r => r.tm);
    const firstCount = mentioned.filter(r => r.tr === 1).length;
    return {
      platform: PLATFORMS[k].label,
      key: k,
      color: PLATFORMS[k].color,
      mention_rate: p.mention_rate,
      avg_position: p.avg_position,
      sov_rank: p.share_of_voice.length > 0 ? p.share_of_voice.findIndex((s) => s.is_target) + 1 : null,
      first_pct: mentioned.length > 0 ? Math.round(firstCount / mentioned.length * 100) : null,
      pending: p.mention_rate === null,
    };
  });

  const scannedPlatforms = crossPlatform.filter((p) => !p.pending);
  const avgMention = scannedPlatforms.length > 0 ? Math.round(scannedPlatforms.reduce((s, p) => s + p.mention_rate, 0) / scannedPlatforms.length * 10) / 10 : 0;

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1a1a" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#e0dfd6", marginBottom: 8 }}>AIO Tracker</div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 24 }}>此頁面需要密碼才能存取</div>
          <input
            type="password"
            placeholder="輸入密碼"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && pw === PASS) setAuthed(true); }}
            style={{ padding: "10px 16px", fontSize: 15, borderRadius: 8, border: "1px solid #444", background: "#2a2a2a", color: "#e0dfd6", width: 220, outline: "none" }}
          />
          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => { if (pw === PASS) setAuthed(true); }}
              style={{ padding: "8px 24px", fontSize: 14, borderRadius: 8, border: "none", background: pw === PASS ? "#5dcaa5" : "#444", color: pw === PASS ? "#000" : "#888", cursor: "pointer", fontWeight: 600 }}
            >進入</button>
          </div>
          {pw.length > 0 && pw !== PASS && <div style={{ color: "#f0997b", fontSize: 12, marginTop: 8 }}>密碼錯誤</div>}
        </div>
      </div>
    );
  }
  const bestPlatform = scannedPlatforms.length > 0 ? scannedPlatforms.reduce((a, b) => a.mention_rate > b.mention_rate ? a : b) : { platform: "—", mention_rate: 0 };
  const worstPlatform = scannedPlatforms.length > 0 ? scannedPlatforms.reduce((a, b) => a.mention_rate < b.mention_rate ? a : b) : { platform: "—", mention_rate: 0 };

  const tabs = [
    { id: "overview", label: "跨平台總覽" },
    { id: "site_ai", label: "📊 站內 AI 成效" },
    { id: "platform", label: "各平台詳情" },
    { id: "prompts", label: "Prompt 明細" },
    { id: "actions", label: "🎯 行動建議" },
    { id: "method", label: "方法論" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter','Noto Sans TC',sans-serif" }}>
      {/* Header with scan selector */}
      <div style={{ padding: "16px 16px 0", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 700 }}>AIO Tracker</span>
            <Badge color={C.green}>MVP</Badge>
          </div>
          {/* Scan selector dropdown */}
          <select
            value={scanSetId}
            onChange={(e) => setScanSetId(e.target.value)}
            style={{
              background: C.surface, color: C.textMuted, border: `1px solid ${C.border}`,
              borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: "pointer",
              outline: "none", maxWidth: 220,
            }}
          >
            {Object.entries(SCAN_SETS).map(([id, s]) => (
              <option key={id} value={id}>{s.label}</option>
            ))}
          </select>
        </div>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 12 }}>
          <span style={{ color: C.brand, fontWeight: 600 }}>{d.brand}</span> 在 {scannedPlatforms.length} 個已掃描 AI 平台的品牌能見度 · {d.scan_date}
        </div>
        <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "8px 14px", fontSize: 12, fontWeight: tab === t.id ? 600 : 400,
              color: tab === t.id ? C.brand : C.textMuted, background: "none", border: "none",
              borderBottom: tab === t.id ? `2px solid ${C.brand}` : "2px solid transparent", cursor: "pointer",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 16px 48px" }}>
        {tab === "overview" && <OverviewTab d={d} crossPlatform={crossPlatform} scannedPlatforms={scannedPlatforms} avgMention={avgMention} bestPlatform={bestPlatform} worstPlatform={worstPlatform} />}
        {tab === "site_ai" && <SiteAITab d={d} />}
        {tab === "platform" && <PlatformTab d={d} />}
        {tab === "prompts" && <PromptsTab d={d} />}
        {tab === "actions" && <ActionsTab d={d} crossPlatform={crossPlatform} />}
        {tab === "method" && <MethodTab d={d} scanSetId={scanSetId} />}
      </div>
    </div>
  );
}

// ─── Overview Tab ────────────────────────────────────
function OverviewTab({ d, crossPlatform, scannedPlatforms, avgMention, bestPlatform, worstPlatform }) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <KPI icon="📡" label="平均提及率" value={`${avgMention}%`} sub={`${scannedPlatforms.length} 平台平均`} color={avgMention >= 50 ? C.green : C.amber} />
        <KPI icon="🏅" label="最佳平台" value={`${bestPlatform.mention_rate}%`} sub={bestPlatform.platform} color={C.brand} />
        <KPI icon="🥇" label="首位推薦率" value={`${scannedPlatforms[0]?.first_pct || 0}%`} sub="被提及時排第一的比例" color={C.green} />
        <KPI icon="⏳" label="待掃描平台" value={`${crossPlatform.length - scannedPlatforms.length}`} sub={crossPlatform.filter(p => p.pending).map(p => p.platform).join(" / ") || "無"} color={C.textDim} />
      </div>

      <Section title="📡 各平台提及率">
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 12px 8px" }}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={crossPlatform.map((p) => ({ ...p, mention_rate: p.mention_rate || 0 }))}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="platform" tick={{ fill: C.textMuted, fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: C.textDim, fontSize: 10 }} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="mention_rate" name="提及率" radius={[6, 6, 0, 0]} barSize={32}>
                {crossPlatform.map((entry, i) => (
                  <Cell key={i} fill={entry.pending ? C.border : entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <Section title="🔎 各平台快照">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {crossPlatform.map((p) => (
            <div key={p.platform} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, opacity: p.pending ? 0.4 : 1 }}>
              <div style={{ width: 4, height: 40, borderRadius: 2, background: p.pending ? C.textDim : p.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{p.platform}</div>
                <div style={{ fontSize: 11, color: C.textDim }}>{p.pending ? "尚未掃描" : `排名 #${p.sov_rank} · 首位推薦 ${p.first_pct}%`}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "monospace", color: p.pending ? C.textDim : p.mention_rate >= 70 ? C.green : p.mention_rate >= 50 ? C.amber : C.red }}>{p.pending ? "—" : `${p.mention_rate}%`}</div>
                <div style={{ fontSize: 10, color: C.textDim }}>{p.pending ? "待掃描" : `avg #${p.avg_position}`}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="📈 提及率趨勢（跨平台）">
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 12px 4px" }}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={d.historical}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="date" tick={{ fill: C.textDim, fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fill: C.textDim, fontSize: 10 }} />
              <Tooltip content={<Tip />} />
              {Object.entries(PLATFORMS).map(([key, p]) => (
                <Line key={key} type="monotone" dataKey={key} name={p.label} stroke={p.color} strokeWidth={2} dot={{ fill: p.color, r: 3 }} connectNulls={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, padding: "8px 0 4px", flexWrap: "wrap" }}>
            {Object.entries(PLATFORMS).map(([key, p]) => (
              <span key={key} style={{ fontSize: 11, color: C.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: p.color, display: "inline-block" }} />
                {p.label}
              </span>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}

// ─── Site AI Performance Tab (unchanged) ─────────────
function SiteAITab({ d }) {
  const s = d.site_ai;
  const [view, setView] = useState("overview");
  const TipPV = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: "#1e293b", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
        <div style={{ color: C.textMuted, marginBottom: 3 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color || C.brand }}>{p.name}: <strong>{p.value?.toLocaleString()}</strong></div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <KPI icon="🌐" label="AI Referral 流量" value={s.ai_referral_pv.toLocaleString()} sub={`佔總流量 ${s.ai_referral_pct}%`} color={C.brand} />
        <KPI icon="📈" label="月增長率" value="+18%" sub="vs 上月" color={C.green} />
        <KPI icon="📄" label="被 AI 引用文章" value={`${s.top_cited_articles.length} 篇`} sub="有 AI referral 流量" color={C.purple} />
        <KPI icon="🏷️" label="品牌合作案" value={`${s.campaign_performance.length} 檔`} sub={`avg ${Math.round(s.campaign_performance.reduce((a, c) => a + c.ai_pct, 0) / s.campaign_performance.length)}% AI 佔比`} color={C.amber} />
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 20, marginBottom: 4 }}>
        {[["overview", "流量概覽"], ["articles", "被引用文章"], ["campaigns", "品牌合作案"]].map(([k, label]) => (
          <button key={k} onClick={() => setView(k)} style={{
            padding: "6px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer",
            background: view === k ? C.brandDim : C.surface,
            color: view === k ? C.brand : C.textMuted,
            border: `1px solid ${view === k ? C.brand + "44" : C.border}`,
            fontWeight: view === k ? 600 : 400,
          }}>{label}</button>
        ))}
      </div>

      {view === "overview" && (
        <>
          <Section title="🔗 AI 流量來源分佈">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {s.ai_sources.map((src) => (
                <div key={src.source} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 4, height: 32, borderRadius: 2, background: src.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{src.source}</div>
                    <div style={{ fontSize: 11, color: C.textDim }}>{src.pv.toLocaleString()} PV</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace", color: src.color }}>{src.pct}%</div>
                    <div style={{ fontSize: 10, color: C.green }}>{src.trend}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
          <Section title="📈 AI Referral 流量趨勢">
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 12px 4px" }}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={s.ai_referral_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="month" tick={{ fill: C.textDim, fontSize: 10 }} tickFormatter={(m) => m.slice(5)} />
                  <YAxis tick={{ fill: C.textDim, fontSize: 10 }} tickFormatter={(v) => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
                  <Tooltip content={<TipPV />} />
                  <Bar dataKey="pv" name="AI Referral PV" fill={C.brand} radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </>
      )}

      {view === "articles" && (
        <Section title="📄 被 AI 引用的熱門文章">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {s.top_cited_articles.map((article, i) => (
              <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.4 }}>{article.title}</div>
                    <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>by {article.author}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "monospace", color: C.brand }}>{article.pv_from_ai.toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: C.textDim }}>AI PV</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {article.sources.map((src) => (
                    <span key={src} style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, color: C.textMuted, background: `${C.textDim}15`, border: `1px solid ${C.border}` }}>{src}</span>
                  ))}
                  {article.campaign && <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 600, color: C.amber, background: C.amberDim }}>🏷️ {article.campaign}</span>}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {view === "campaigns" && (
        <>
          <Section title="🏷️ 品牌合作案 AI 成效">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {s.campaign_performance.map((camp, i) => (
                <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 0, overflow: "hidden" }}>
                  <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{camp.campaign}</span>
                      <span style={{ margin: "0 8px", color: C.border }}>·</span>
                      <span style={{ fontSize: 12, color: C.textMuted }}>{camp.brand}</span>
                    </div>
                    <Badge color={camp.status === "active" ? C.green : C.textDim}>{camp.status === "active" ? "進行中" : "已結案"}</Badge>
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
                      {[["總 PV", camp.total_pv, C.text], ["AI PV", camp.ai_pv, C.brand], ["AI 佔比", `${camp.ai_pct}%`, C.green]].map(([lbl, val, clr]) => (
                        <div key={lbl} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "monospace", color: clr }}>{typeof val === "number" ? val.toLocaleString() : val}</div>
                          <div style={{ fontSize: 10, color: C.textDim }}>{lbl}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: C.textDim }}>引用來源：</span>
                      {camp.ai_sources.map((src) => (
                        <span key={src} style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, color: C.textMuted, background: `${C.textDim}15` }}>{src}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
          <Section title="💡 品牌主報告亮點">
            <div style={{ background: C.amberDim, border: `1px solid ${C.amber}33`, borderRadius: 10, padding: "14px 16px", fontSize: 13, lineHeight: 1.7 }}>
              <div style={{ color: C.text, fontWeight: 600, marginBottom: 6 }}>這些數字可以直接放入品牌主報告：</div>
              <div style={{ color: C.textMuted }}>
                「您在 vocus 上的合作內容，除了獲得站內自然流量外，額外有 <span style={{ color: C.amber, fontWeight: 600 }}>{Math.round(s.campaign_performance.reduce((a, c) => a + c.ai_pct, 0) / s.campaign_performance.length)}%</span> 的流量來自 AI 搜尋引擎的主動引用。」
              </div>
            </div>
          </Section>
        </>
      )}
    </>
  );
}

// ─── Platform Detail Tab ─────────────────────────────
function PlatformTab({ d }) {
  const available = Object.entries(d.platforms).filter(([_, p]) => p.mention_rate !== null);
  const [selected, setSelected] = useState(available[0]?.[0] || "claude");
  const p = d.platforms[selected];
  const pInfo = PLATFORMS[selected];

  if (!p || p.mention_rate === null) return <div style={{ color: C.textDim, padding: 20 }}>此平台尚未掃描</div>;

  // Calculate mention counts from prompt data
  const allRuns = (p.prompts || []).flatMap(pr => pr.runs);
  const mentionedRuns = allRuns.filter(r => r.tm);
  const totalRuns = allRuns.length;
  const mentionedCount = mentionedRuns.length;

  // Calculate rank distribution
  const rankDist = { first: 0, top3: 0, later: 0, none: totalRuns - mentionedCount };
  mentionedRuns.forEach(r => {
    if (r.tr === 1) rankDist.first++;
    else if (r.tr <= 3) rankDist.top3++;
    else rankDist.later++;
  });
  const rankData = [
    { name: "🥇 首位推薦", value: rankDist.first, fill: C.green },
    { name: "🥈 前三推薦", value: rankDist.top3, fill: C.brand },
    { name: "📋 有提及但排後段", value: rankDist.later, fill: C.amber },
    { name: "❌ 未提及", value: rankDist.none, fill: C.textDim + "66" },
  ].filter(d => d.value > 0);

  const sovData = p.share_of_voice.map((s) => ({ name: s.name, share: Math.round(s.share * 100) }));
  const catData = Object.entries(p.by_category).map(([name, val]) => ({ name: CAT_SHORT[name] || name, rate: val.rate || 0 }));

  return (
    <>
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {Object.entries(PLATFORMS).map(([key, info]) => {
          const plat = d.platforms[key];
          const isPending = plat.mention_rate === null;
          return (
            <button key={key} onClick={() => !isPending && setSelected(key)} style={{
              padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
              cursor: isPending ? "default" : "pointer", opacity: isPending ? 0.35 : 1,
              background: selected === key ? info.color + "22" : C.surface,
              color: selected === key ? info.color : C.textMuted,
              border: `1px solid ${selected === key ? info.color + "66" : C.border}`,
            }}>
              {info.icon} {info.label}
              <span style={{ marginLeft: 6, fontFamily: "monospace", fontWeight: 700 }}>{isPending ? "—" : `${plat.mention_rate}%`}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 4 }}>
        <KPI icon="📡" label="提及率" value={`${p.mention_rate}%`} sub={`${mentionedCount} / ${totalRuns} 次回覆`} color={p.mention_rate >= 70 ? C.green : p.mention_rate >= 50 ? C.amber : C.red} />
        <KPI icon="🏅" label="平均排名" value={`#${p.avg_position}`} color={pInfo.color} />
        <KPI icon="⚔️" label="聲量排名" value={`#${p.share_of_voice.findIndex((s) => s.is_target) + 1}`} sub={`/ ${p.share_of_voice.length} 品牌`} color={C.purple} />
      </div>

      <Section title={`⚔️ ${pInfo.label} 聲量佔比`}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 12px 4px" }}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sovData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: C.textDim, fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={65} tick={{ fill: C.textMuted, fontSize: 11 }} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="share" name="Share" radius={[0, 6, 6, 0]} barSize={16}>
                {sovData.map((entry, i) => (
                  <Cell key={i} fill={p.share_of_voice[i]?.is_target ? pInfo.color : C.textDim} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <Section title="📂 分類提及率">
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px" }}>
          {catData.map((c) => (
            <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ width: 65, fontSize: 12, color: C.textMuted, flexShrink: 0 }}>{c.name}</span>
              <div style={{ flex: 1, height: 8, background: C.border, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${c.rate}%`, height: "100%", background: c.rate >= 80 ? C.green : c.rate >= 50 ? C.amber : c.rate > 0 ? C.red : C.border, borderRadius: 4, transition: "width 0.4s" }} />
              </div>
              <span style={{ fontSize: 12, fontFamily: "monospace", color: C.text, width: 35, textAlign: "right" }}>{c.rate}%</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="🏅 品牌排名分佈">
        <div style={{ fontSize: 11, color: C.textDim, marginBottom: 8 }}>當 AI 有提及品牌時，它在回覆中的推薦順位</div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "8px 0" }}>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={rankData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} strokeWidth={0}>
                {rankData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: C.textMuted }} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Section>
    </>
  );
}

// ─── Prompts Tab (REDESIGNED with brand rankings) ───
function PromptsTab({ d }) {
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const categories = [...new Set(d.prompt_details.map((p) => CAT_SHORT[p.category] || p.category))];
  const filtered = filter === "all"
    ? d.prompt_details
    : d.prompt_details.filter((p) => (CAT_SHORT[p.category] || p.category) === filter);

  // Get active (scanned) platform keys
  const activePlatformKeys = Object.entries(d.platforms)
    .filter(([_, p]) => p.mention_rate !== null)
    .map(([k]) => k);

  return (
    <>
      <Section title="🔍 跨平台 Prompt 明細">
        {/* Category filter */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {[["all", "全部"], ...categories.map((c) => [c, c])].map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)} style={{
              padding: "5px 12px", borderRadius: 99, fontSize: 11, cursor: "pointer",
              background: filter === key ? C.brand : C.surface, color: filter === key ? C.bg : C.textMuted,
              border: `1px solid ${filter === key ? C.brand : C.border}`,
            }}>{label}</button>
          ))}
        </div>

        {/* Prompt cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((p) => {
            const isExpanded = expandedId === p.id;
            return (
              <div key={p.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
                {/* Prompt header */}
                <div style={{ padding: "12px 14px", cursor: "pointer" }} onClick={() => setExpandedId(isExpanded ? null : p.id)}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: 10, color: C.textDim, fontFamily: "monospace" }}>{p.id}</span>
                      <span style={{ margin: "0 6px", color: C.border }}>·</span>
                      <Badge color={C.purple}>{CAT_SHORT[p.category] || p.category}</Badge>
                    </div>
                    <span style={{ fontSize: 11, color: C.textDim }}>{isExpanded ? "▼" : "▶"} 排名明細</span>
                  </div>
                  <div style={{ fontSize: 13, color: C.text, marginBottom: 10, lineHeight: 1.5 }}>「{p.text}」</div>

                  {/* Platform summary cells */}
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(${activePlatformKeys.length}, 1fr)`, gap: 6 }}>
                    {activePlatformKeys.map((key) => {
                      const info = PLATFORMS[key];
                      const runs = p.platformRuns?.[key];
                      if (!runs) return null;
                      const mentionCount = runs.filter(r => r.tm).length;
                      const avgRank = mentionCount > 0
                        ? Math.round(runs.filter(r => r.tm).reduce((s, r) => s + r.tr, 0) / mentionCount * 10) / 10
                        : null;

                      return (
                        <div key={key} style={{
                          padding: "8px 8px", borderRadius: 6, textAlign: "center",
                          background: mentionCount === 0 ? C.redDim : mentionCount === 3 ? C.greenDim : C.amberDim,
                          borderTop: `2px solid ${mentionCount === 0 ? C.red + "44" : mentionCount === 3 ? info.color : C.amber}`,
                        }}>
                          <div style={{ fontSize: 10, color: C.textDim, marginBottom: 2 }}>{info.label}</div>
                          <div style={{ fontWeight: 700, fontSize: 16, fontFamily: "monospace", color: mentionCount === 0 ? C.red : info.color }}>
                            {mentionCount === 0 ? "✗" : `${mentionCount}/3`}
                          </div>
                          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 1 }}>
                            {mentionCount > 0 ? `avg #${avgRank}` : "未提及"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Expanded: full brand rankings per run */}
                {isExpanded && (
                  <div style={{ borderTop: `1px solid ${C.border}`, padding: "12px 14px", background: `${C.bg}` }}>
                    {activePlatformKeys.map((key) => {
                      const info = PLATFORMS[key];
                      const runs = p.platformRuns?.[key];
                      if (!runs) return null;

                      return (
                        <div key={key} style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: info.color, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                            {info.icon} {info.label}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {runs.map((run) => (
                              <div key={run.ri} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: run.br.length > 0 ? 6 : 0 }}>
                                  <span style={{ fontSize: 10, color: C.textDim, fontFamily: "monospace", width: 42, flexShrink: 0 }}>Run {run.ri + 1}</span>
                                  {run.tm ? (
                                    <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: C.greenDim, color: C.green, fontWeight: 600 }}>
                                      ✓ #{run.tr}
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: C.redDim, color: C.red }}>
                                      ✗ 未提及
                                    </span>
                                  )}
                                  {run.ts && run.ts !== "not_applicable" && (
                                    <span style={{ fontSize: 10, color: C.textDim }}>
                                      {run.ts === "positive" ? "👍" : run.ts === "neutral" ? "➖" : "👎"}
                                    </span>
                                  )}
                                </div>
                                {/* Brand ranking chain */}
                                {run.br.length > 0 && (
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: 3, alignItems: "center" }}>
                                    {run.br.map((b, i) => (
                                      <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
                                        {i > 0 && <span style={{ color: C.textDim, fontSize: 10, margin: "0 1px" }}>›</span>}
                                        <span style={{
                                          fontSize: 11, padding: "1px 6px", borderRadius: 4,
                                          background: b.t ? `${info.color}22` : `${C.textDim}10`,
                                          color: b.t ? info.color : C.textMuted,
                                          fontWeight: b.t ? 700 : 400,
                                          border: b.t ? `1px solid ${info.color}44` : "1px solid transparent",
                                        }}>
                                          #{b.r} {b.n}
                                        </span>
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {run.br.length === 0 && (
                                  <div style={{ fontSize: 11, color: C.textDim, fontStyle: "italic" }}>（無品牌被提及）</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>
    </>
  );
}

// ─── Actions Tab ─────────────────────────────────────
function ActionsTab({ d, crossPlatform }) {
  const recommendations = useMemo(() => {
    const recs = [];
    const scanned = crossPlatform.filter(p => !p.pending);

    // 1. Platform-level gaps
    scanned.forEach((p) => {
      if (p.mention_rate < 50) {
        const best = scanned.reduce((a, b) => a.mention_rate > b.mention_rate ? a : b);
        recs.push({
          priority: "P0", type: "platform_gap",
          title: `${p.platform} 提及率僅 ${p.mention_rate}%`,
          detail: `相比最佳平台（${best.platform} ${best.mention_rate}%），落差達 ${Math.round(best.mention_rate - p.mention_rate)}%。`,
          actions: [
            `研究 ${p.platform} 的訓練資料來源偏好，針對性產出內容`,
            `確認品牌網站是否被 ${p.platform} 的 crawler 正確索引`,
            `增加在該平台偏好的內容源上的品牌露出`,
          ],
          color: C.red, platform: p.key,
        });
      } else if (p.mention_rate < 65) {
        recs.push({
          priority: "P1", type: "platform_gap",
          title: `${p.platform} 提及率偏低（${p.mention_rate}%）`,
          detail: `排名 #${p.sov_rank}，首位推薦率 ${p.first_pct}%。`,
          actions: [`強化品牌相關的結構化資料（Schema.org、FAQ）`, `產出更多權威內容`],
          color: C.amber, platform: p.key,
        });
      }
    });

    // 2. Category-level gaps
    const allCategories = {};
    Object.entries(d.platforms).forEach(([pk, pv]) => {
      if (pv.mention_rate === null) return;
      Object.entries(pv.by_category).forEach(([cat, val]) => {
        if (!allCategories[cat]) allCategories[cat] = {};
        allCategories[cat][pk] = val.rate;
      });
    });

    Object.entries(allCategories).forEach(([cat, platforms]) => {
      const vals = Object.values(platforms);
      const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
      const shortCat = CAT_SHORT[cat] || cat;
      if (avg < 20) {
        recs.push({
          priority: "P0", type: "category_gap",
          title: `「${shortCat}」類提問幾乎無曝光（平均 ${Math.round(avg)}%）`,
          detail: `AI 幾乎不會在此類意圖中提及品牌，品牌在「泛產業認知」層面存在感不足。`,
          actions: [
            `產出產業觀點、趨勢分析等內容，建立品牌的產業級能見度`,
            `爭取在產業媒體、研究報告中被引用或提及`,
            `建立 llms.txt 和結構化品牌資訊頁`,
          ],
          color: C.red,
        });
      } else if (avg < 50) {
        const weak = Object.entries(platforms).filter(([_, v]) => v < 40).map(([pk]) => PLATFORMS[pk]?.label).join("、");
        recs.push({
          priority: "P1", type: "category_gap",
          title: `「${shortCat}」類提問表現偏弱（平均 ${Math.round(avg)}%）`,
          detail: weak ? `特別弱的平台：${weak}` : `各平台表現均未達理想水準。`,
          actions: [`針對此類意圖的常見提問，產出直接對應的內容`, `加入更多意圖匹配的關鍵字`],
          color: C.amber,
        });
      }
    });

    // 3. Competitor dominance
    Object.entries(d.platforms).forEach(([pk, pv]) => {
      if (pv.mention_rate === null) return;
      const target = pv.share_of_voice.find((s) => s.is_target);
      const leader = pv.share_of_voice[0];
      if (target && leader && !leader.is_target && leader.share - target.share > 0.15) {
        recs.push({
          priority: "P1", type: "competitor",
          title: `${PLATFORMS[pk].label} 上被 ${leader.name} 領先`,
          detail: `${leader.name}（${Math.round(leader.share * 100)}%）領先品牌（${Math.round(target.share * 100)}%）達 ${Math.round((leader.share - target.share) * 100)}%。`,
          actions: [`分析 ${leader.name} 被 AI 引用的內容特徵`, `針對弱項主題產出差異化內容`],
          color: C.amber, platform: pk,
        });
      }
    });

    // 4. Quick wins
    const mixed = d.prompt_details.filter((p) => {
      const vals = Object.values(p.results);
      const mentioned = vals.filter((r) => r.mentioned).length;
      return mentioned > 0 && mentioned < vals.filter(r => r.mentioned !== null).length;
    });

    if (mixed.length > 0) {
      recs.push({
        priority: "P2", type: "quick_win",
        title: `${mixed.length} 組 prompt 有「部分平台提及」的機會`,
        detail: `例如：「${mixed[0].text}」——已有基礎，補齊成本最低。`,
        actions: [`優先處理「半成功」prompt 對應的內容`, `分析有提及平台的引用內容，複製到其他管道`],
        color: C.green,
      });
    }

    return recs.sort((a, b) => ({ P0: 0, P1: 1, P2: 2 }[a.priority] - { P0: 0, P1: 1, P2: 2 }[b.priority]));
  }, [d, crossPlatform]);

  const priorityCounts = {
    P0: recommendations.filter((r) => r.priority === "P0").length,
    P1: recommendations.filter((r) => r.priority === "P1").length,
    P2: recommendations.filter((r) => r.priority === "P2").length,
  };

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 4 }}>
        {[["P0", "急迫", C.red, C.redDim], ["P1", "重要", C.amber, C.amberDim], ["P2", "快速贏", C.green, C.greenDim]].map(([p, lbl, clr, bg]) => (
          <div key={p} style={{ background: bg, border: `1px solid ${clr}33`, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: clr, fontFamily: "monospace" }}>{priorityCounts[p]}</div>
            <div style={{ fontSize: 11, color: clr, marginTop: 2 }}>{p} — {lbl}</div>
          </div>
        ))}
      </div>

      <Section title="🎯 優先行動清單">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {recommendations.map((rec, i) => (
            <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: `${rec.color}08` }}>
                <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: rec.color, background: `${rec.color}22` }}>{rec.priority}</span>
                <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 500, color: C.textDim, background: `${C.textDim}15` }}>
                  {rec.type === "platform_gap" ? "平台缺口" : rec.type === "category_gap" ? "意圖盲區" : rec.type === "competitor" ? "競爭者威脅" : "快速機會"}
                </span>
                {rec.platform && (
                  <span style={{ marginLeft: "auto", fontSize: 11, color: PLATFORMS[rec.platform]?.color }}>
                    {PLATFORMS[rec.platform]?.icon} {PLATFORMS[rec.platform]?.label}
                  </span>
                )}
              </div>
              <div style={{ padding: "12px 14px" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 6 }}>{rec.title}</div>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 12, lineHeight: 1.6 }}>{rec.detail}</div>
                <div style={{ fontSize: 12, color: C.textDim, marginBottom: 6, fontWeight: 500 }}>建議行動：</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {rec.actions.map((action, j) => (
                    <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>
                      <span style={{ color: rec.color, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>→</span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="💡 整體洞察">
        <div style={{ background: C.brandDim, border: `1px solid ${C.brand}33`, borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>
            <span style={{ fontWeight: 600 }}>{d.brand}</span> 在 AI 生態系中的能見度呈現
            <span style={{ fontWeight: 600, color: C.amber }}>明顯的平台落差</span>。
            建議優先處理 P0 級的平台缺口和意圖盲區，再利用 P2 快速贏取得短期成效。
          </div>
        </div>
      </Section>
    </>
  );
}

// ─── Method Tab ──────────────────────────────────────
function MethodTab({ d, scanSetId }) {
  const ver = SCAN_SETS[scanSetId]?.version;
  const isV4 = ver === "v4";
  const isV5 = ver === "v5";
  return (
    <Section title="📖 方法論">
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 16px", fontSize: 13, lineHeight: 1.8, color: C.textMuted }}>
        <h3 style={{ color: C.text, fontSize: 15, marginBottom: 8, fontWeight: 600 }}>什麼是 GEO (Generative Engine Optimization
)及AIO（AI Optimization）？</h3>
        <p style={{ marginBottom: 14 }}>
          GEO是指為了提升在生成式人工智慧中的可見性、引用率和推薦質量，而對內容、結構、表達方式等進行有針對性優化的一種內容策略。當使用者透過 AI 工具搜尋產品或服務時，AI 回覆中是否提及您的品牌、排在第幾位、以什麼語氣描述——這就是 AI 品牌能見度。
        </p>

        <h3 style={{ color: C.text, fontSize: 15, marginBottom: 8, fontWeight: 600 }}>追蹤方法</h3>
        <p style={{ marginBottom: 14 }}>
          {isV5
            ? "我們對具有即時搜尋能力的 AI 平台（ChatGPT via Bing、Claude Search via Brave）發送 10 組關鍵字式 prompt（三類：品類關鍵字、場景關鍵字、品牌指名），每組重複 4-8 次以衡量回覆穩定性。v5 專注測試不同搜尋引擎後端對品牌能見度的影響。"
            : isV4
            ? "我們對具有即時搜尋能力的 AI 平台（Perplexity、Gemini）發送 24 組策略性 prompt（四軸策略設計），每組重複 3 次以衡量回覆穩定性。再以 AI 分析每則回覆中的品牌提及狀況、排名、情感、競爭者對比。v4 專注測試 vocus 站上合作文章在 AI 搜尋中的能見度（content → citation pipeline 驗證）。"
            : "我們對多個 AI 平台發送相同的模擬使用者 prompt（三層消費者漏斗：問題導向 / 品牌確認 / 品類搜尋），每組 prompt 重複執行 3 次以衡量回覆穩定性。再以 AI 分析每則回覆中的品牌提及狀況、排名、情感、競爭者對比。"}
        </p>

        <h3 style={{ color: C.text, fontSize: 15, marginBottom: 8, fontWeight: 600 }}>{isV5 ? "三類關鍵字策略" : isV4 ? "四軸 Prompt 策略" : "三層消費者漏斗"}</h3>
        {isV5 ? [
          ["品類關鍵字", "搜尋產品品類，測試品牌是否出現在 AI 推薦清單：「除濕盒推薦」「吊掛式除濕袋比較」", C.green],
          ["場景關鍵字", "搜尋使用場景或問題，測試 AI 是否進入教學模式而非推薦模式：「房間除濕方法」「梅雨季防潮」", C.amber],
          ["品牌指名", "直接搜尋品牌名，測試 AI 對品牌的認知與定位：「克潮靈除濕盒」", C.red],
        ].map(([t, desc, clr]) => (
          <div key={t} style={{ padding: "10px 12px", background: C.bg, borderRadius: 6, border: `1px solid ${C.border}`, marginBottom: 6 }}>
            <span style={{ color: clr, fontWeight: 600, fontSize: 12 }}>{t}</span>
            <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>{desc}</div>
          </div>
        )) : isV4 ? [
          ["軸一：搜尋競爭密度控制", "極窄長尾問題（黏土防潮、塔羅牌、養貓家庭），vocus 文章可能是唯一內容源", C.red],
          ["軸二：內容格式信號", "帶「心得/實測/分享」引導搜尋引擎抓 UGC 而非電商", C.amber],
          ["軸三：同主題梯度測試", "同一主題從寬→中→窄，觀察品牌在哪個具體度出現", C.green],
          ["軸四：排除式引導", "排除電商/論壇/影片，看部落格內容能不能浮上來", C.purple],
        ].map(([t, desc, clr]) => (
          <div key={t} style={{ padding: "10px 12px", background: C.bg, borderRadius: 6, border: `1px solid ${C.border}`, marginBottom: 6 }}>
            <span style={{ color: clr, fontWeight: 600, fontSize: 12 }}>{t}</span>
            <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>{desc}</div>
          </div>
        )) : [
          ["問題導向（不知品牌）", "使用者有問題但不知道品牌存在：「衣服發霉怎麼辦」", C.red],
          ["品牌確認（聽過想確認）", "使用者聽過品牌想進一步了解：「克潮靈好用嗎」", C.green],
          ["品類搜尋（不提品牌）", "使用者搜尋品類但不指定品牌：「除濕盒推薦」", C.amber],
        ].map(([t, desc, clr]) => (
          <div key={t} style={{ padding: "10px 12px", background: C.bg, borderRadius: 6, border: `1px solid ${C.border}`, marginBottom: 6 }}>
            <span style={{ color: clr, fontWeight: 600, fontSize: 12 }}>{t}</span>
            <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>{desc}</div>
          </div>
        ))}

        <h3 style={{ color: C.text, fontSize: 15, margin: "14px 0 8px", fontWeight: 600 }}>核心指標</h3>
        {[
          ["提及率", "品牌在 AI 回覆中被提到的比例（X/3 runs 提及）"],
          ["平均排名", "被提及時通常排第幾位（#1 = 最先推薦）"],
          ["聲量佔比", "相對於所有競爭品牌的提及頻率"],
          ["品牌排名鏈", "每次 run 的完整品牌推薦順序，可在 Prompt 明細 tab 查看"],
        ].map(([t, desc]) => (
          <div key={t} style={{ padding: "10px 12px", background: C.bg, borderRadius: 6, border: `1px solid ${C.border}`, marginBottom: 6 }}>
            <span style={{ color: C.brand, fontWeight: 600, fontSize: 12 }}>{t}</span>
            <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>{desc}</div>
          </div>
        ))}

        <h3 style={{ color: C.text, fontSize: 15, margin: "14px 0 8px", fontWeight: 600 }}>重要限制</h3>
        <p style={{ fontSize: 12 }}>
          LLM 回覆具有非確定性——相同問題每次可能得到不同答案。本報告透過每組 prompt 重複執行 3 次降低隨機性影響，但結果仍應視為趨勢觀察而非精確數字。
          各平台追蹤方式不同（API 呼叫 vs 瀏覽器自動化），可能影響結果的可比性。
        </p>
      </div>
    </Section>
  );
}
