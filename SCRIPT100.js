 // --- Star Animation Logic ---
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let stars = [];

    function initStars() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        stars = [];
        for(let i=0; i<150; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2,
                speed: Math.random() * 0.5
            });
        }
    }

    function drawStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#00d4ff";
        stars.forEach(s => {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI*2);
            ctx.fill();
            s.y += s.speed;
            if(s.y > canvas.height) s.y = 0;
        });
        requestAnimationFrame(drawStars);
    }

    window.addEventListener('resize', initStars);
    initStars();
    drawStars();

    // --- AI Brain API Logic ---
    async function fetchAIResponse(prompt) {
        try {
            const response = await fetch(`https://text.pollinations.ai/prompt/${encodeURIComponent(prompt)}?system=You are AETHER AI, a futuristic and helpful AI assistant created by Muhammad Taqi. Keep your answers concise, clean and direct.`);
            if (response.ok) {
                const text = await response.text();
                return text.replace(/\n/g, "<br>");
            }
            return null;
        } catch (err) {
            return null;
        }
    }

    // --- Main Core Function (UI aur PostMessage dono ke liye call hoga) ---
    async function askAether(externalQuery = null) {
        const input = document.getElementById('userInput');
        const box = document.getElementById('chatBox');
        
        const val = externalQuery ? externalQuery.trim() : input.value.trim();

        if(!val) return "Empty query received.";

        // User ka message screen par dikhana
        box.innerHTML += `<div class="message user-msg">${val}</div>`;
        if(!externalQuery) input.value = ""; 

        const lowVal = val.toLowerCase();
        
        // Owner Logic
        if(["owner","creator","who made you","taqi","mt","muhammad taqi"].some(k => lowVal.includes(k))) {
            const ownerReply = "<strong>Muhammad Taqi</strong> is my owner and the architect of AETHER AI.";
            setTimeout(() => {
                box.innerHTML += `<div class="message ai-msg">${ownerReply}</div>`;
                box.scrollTop = box.scrollHeight;
            }, 600);
            return ownerReply;
        }

        // Loading message
        const loadingId = "load-" + Date.now();
        box.innerHTML += `<div class="message ai-msg" id="${loadingId}">Scanning Global Web Archives...</div>`;
        box.scrollTop = box.scrollHeight;

        try {
            // 1st Step: DuckDuckGo API Search
            const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(val)}&format=json&origin=*`;
            const res = await fetch(url);
            const data = await res.json();

            let answer = "";

            if (data.AbstractText) {
                answer = `<strong>${data.Heading}:</strong><br>${data.AbstractText}`;
            } 
            else if (data.RelatedTopics && data.RelatedTopics.length > 0 && data.RelatedTopics[0].Text) {
                answer = data.RelatedTopics[0].Text;
            } 

            // Loading hatao
            document.getElementById(loadingId).remove();

            // 2nd Step: AI Brain Fallback
            if (!answer) {
                box.innerHTML += `<div class="message ai-msg" id="${loadingId}">AETHER Brain computing response...</div>`;
                box.scrollTop = box.scrollHeight;
                
                const aiAnswer = await fetchAIResponse(val);
                
                document.getElementById(loadingId).remove();
                
                if(aiAnswer) {
                    answer = aiAnswer;
                } else {
                    answer = "I couldn't fetch data from search or AI nodes.";
                }
            }

            box.innerHTML += `<div class="message ai-msg">${answer}</div>`;
            box.scrollTop = box.scrollHeight;
            return answer; 

        } catch(e) {
            if(document.getElementById(loadingId)) {
                document.getElementById(loadingId).remove();
            }
            const errorMsg = "Signal lost. External network blocked or connection failed.";
            box.innerHTML += `<div class="message ai-msg">${errorMsg}</div>`;
            box.scrollTop = box.scrollHeight;
            return errorMsg;
        }
    }

    // UI Trigger Listeners
    document.getElementById('userInput').addEventListener('keypress', (e) => { if(e.key === 'Enter') askAether(); });

    // --- AI-2 Communication Event Listener ---
    window.addEventListener('message', async (event) => {
        if (!event.data || !event.data.query) return; 

        try {
            // AI-1 query execute karega aur response store karega
            const aiAnswer = await askAether(event.data.query);

            // Jawab wapas AI-2 ko bhejna (Cross-Origin safe)
            event.source.postMessage({ answer: aiAnswer }, event.origin);

        } catch (error) {
            console.error(error);
            event.source.postMessage({ answer: "Error: AI-1 respond nahi kar saka." }, event.origin);
        }
    });
