const API_URL = "";


/* =========================================================
   ELEMENTS
========================================================= */

const questionInput =
    document.getElementById("questionInput");

const askButton =
    document.getElementById("askButton");

const answerCard =
    document.getElementById("answerCard");

const sourcesContainer =
    document.getElementById("sourcesContainer");

const sourceCount =
    document.getElementById("sourceCount");

const apiStatus =
    document.getElementById("apiStatus");

const connectionText =
    document.getElementById("connectionText");


/* =========================================================
   CHECK API
========================================================= */

async function checkAPI() {

    try {

        const response =
            await fetch(`${API_URL}/health`);

        if (!response.ok) {
            throw new Error("API unavailable");
        }

        const data =
            await response.json();

        apiStatus.textContent =
            `${data.indexed_chunks} chunks indexed`;

        connectionText.textContent =
            "API Connected";

    } catch (error) {

        apiStatus.textContent =
            "API unavailable";

        connectionText.textContent =
            "API Offline";
    }
}


/* =========================================================
   ASK QUESTION
========================================================= */

async function askQuestion() {

    const question =
        questionInput.value.trim();

    if (!question) {

        questionInput.focus();

        return;
    }


    askButton.disabled = true;

    askButton.innerHTML =
        "Thinking...";


    answerCard.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            Searching documents and generating answer...
        </div>
    `;


    sourcesContainer.innerHTML = `
        <div class="sources-empty">
            Searching your knowledge base...
        </div>
    `;

    sourceCount.textContent =
        "Searching";


    try {

        const response =
            await fetch(
                `${API_URL}/rag/query`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        question: question,
                        top_k: 5
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Something went wrong."
            );
        }


        displayAnswer(data);

        displaySources(
            data.sources || []
        );


    } catch (error) {

        answerCard.innerHTML = `
            <div class="error-message">
                <strong>Unable to get an answer.</strong>
                <br>
                ${escapeHTML(error.message)}
            </div>
        `;

        sourcesContainer.innerHTML = `
            <div class="sources-empty">
                No sources available.
            </div>
        `;

        sourceCount.textContent =
            "0 sources";


    } finally {

        askButton.disabled = false;

        askButton.innerHTML =
            `Ask AI <span>→</span>`;
    }
}


/* =========================================================
   DISPLAY ANSWER
========================================================= */

function displayAnswer(data) {

    answerCard.innerHTML = `
        <div class="answer-text">
            ${escapeHTML(data.answer)}
        </div>
    `;
}


/* =========================================================
   DISPLAY SOURCES
========================================================= */

function displaySources(sources) {

    sourceCount.textContent =
        `${sources.length} ${
            sources.length === 1
                ? "source"
                : "sources"
        }`;


    if (sources.length === 0) {

        sourcesContainer.innerHTML = `
            <div class="sources-empty">
                No sources were retrieved.
            </div>
        `;

        return;
    }


    sourcesContainer.innerHTML =
        sources.map(
            (source) => {

                const fileName =
                    source.source ||
                    "Unknown file";


                const extension =
                    fileName
                        .split(".")
                        .pop()
                        .toLowerCase();


                const icon =
                    extension === "pdf"
                        ? "📕"
                        : extension === "md"
                            ? "📝"
                            : "📄";


                const pageText =
                    source.page &&
                    source.page > 0
                        ? `Page ${source.page}`
                        : "Text document";


                return `
                    <article class="source-card">

                        <div class="source-header">

                            <div class="file-icon">
                                ${icon}
                            </div>

                            <div>

                                <div class="source-name">
                                    ${escapeHTML(fileName)}
                                </div>

                                <div class="source-meta">
                                    ${pageText}
                                    · Chunk ${source.chunk}
                                </div>

                            </div>

                        </div>


                        <div class="source-text">
                            ${escapeHTML(
                                source.text || ""
                            )}
                        </div>

                    </article>
                `;
            }
        )
        .join("");
}


/* =========================================================
   HTML SAFETY
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


/* =========================================================
   EVENTS
========================================================= */

askButton.addEventListener(
    "click",
    askQuestion
);


questionInput.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter" &&
            event.ctrlKey
        ) {

            event.preventDefault();

            askQuestion();
        }
    }
);


/* =========================================================
   STARTUP
========================================================= */

checkAPI();