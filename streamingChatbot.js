// webStreamsDemo.js
import { LightningElement, track } from 'lwc';

const API_URL = "https://api.openai.com/v1/chat/completions";
const API_KEY = "<your api key>"; // Update with your API key

export default class WebStreamsDemo extends LightningElement {
    promptInput;
    resultText;
    responseText; // Declare variable in the broader scope

    async handleGenerate() {
        this.promptInput = this.template.querySelector(".promptInput").value;
        this.resultText = this.template.querySelector(".resultText");

        if (!this.promptInput) {
            alert("Please enter a prompt.");
            return;
        }

        const requestBody = JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: `"${this.promptInput}"` }],
            max_tokens: 1000,
            stream: true,
        });

        console.log('REQUEST BODY:', requestBody);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_KEY}`,
                },
                body: requestBody,
            });
            const reader = await response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            while (true) {
                const { done, value } =  await reader.read();
                    if (done) {
                        break;
                    }
                const chunk = decoder.decode(value);
                const lines = chunk
                .split("\n")
                .filter((line) => !line.startsWith("data: [DONE]"))
                .map((line) => line.replace(/^data: /, "").trim())
                for (let i = 0; i < lines.length; i++) {
                    const parsedLine = lines[i];
                    console.log(parsedLine)
                    // Find the start and end index of the "content" key
                    const startIndex = parsedLine.indexOf('"content":') + '"content":'.length;
                    console.log('Startindex'+ startIndex);
                    const endIndex = parsedLine.indexOf('}', startIndex);
                    // Extract the content value using substring
                    const contentValue = parsedLine.substring(startIndex, endIndex);
                    if(contentValue.startsWith('atcmpl-')){
                        contentValue = '';
                    }
                    if (contentValue) {
                        this.resultText.innerText += contentValue.replace(/"/g, '');
                    }
                }
            }
        } catch (error) {
            console.log("Fetch error:", JSON.stringify(error));
            // Handle errors
        }
    }
}
