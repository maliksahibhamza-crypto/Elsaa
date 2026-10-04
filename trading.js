"use strict";

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    where,
    getDocs,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// =========================================
// ASSETS
// =========================================

const ASSETS = [

    {
        id: "hazel-tech",
        name: "HAZEL Technologies",
        symbol: "HZT",
        category: "Company",
        icon: "fa-microchip",
        initialPrice: 42
    },

    {
        id: "hazel-motors",
        name: "HAZEL Motors",
        symbol: "HZM",
        category: "Company",
        icon: "fa-car",
        initialPrice: 28
    },

    {
        id: "hazel-ai",
        name: "HAZEL AI",
        symbol: "HZAI",
        category: "Company",
        icon: "fa-brain",
        initialPrice: 65
    },

    {
        id: "gold",
        name: "Gold",
        symbol: "GOLD",
        category: "Commodity",
        icon: "fa-coins",
        initialPrice: 91
    },

    {
        id: "oil",
        name: "Oil",
        symbol: "OIL",
        category: "Commodity",
        icon: "fa-droplet",
        initialPrice: 58
    },

    {
        id: "diamond",
        name: "Diamond",
        symbol: "DIA",
        category: "Commodity",
        icon: "fa-gem",
        initialPrice: 100
    },

    {
        id: "crystal",
        name: "Crystal",
        symbol: "CRY",
        category: "Rare Asset",
        icon: "fa-star",
        initialPrice: 36
    },

    {
        id: "ancient-coin",
        name: "Ancient Coin",
        symbol: "ACN",
        category: "Rare Asset",
        icon: "fa-circle",
        initialPrice: 74
    },

    {
        id: "royal-crown",
        name: "Royal Crown",
        symbol: "RCR",
        category: "Rare Asset",
        icon: "fa-crown",
        initialPrice: 88
    },

    {
        id: "tower",
        name: "Tower",
        symbol: "TWR",
        category: "Property",
        icon: "fa-building",
        initialPrice: 54
    },

    {
        id: "villas",
        name: "Villas",
        symbol: "VIL",
        category: "Property",
        icon: "fa-house",
        initialPrice: 47
    },

    {
        id: "business-center",
        name: "Business Center",
        symbol: "BIZ",
        category: "Property",
        icon: "fa-city",
        initialPrice: 79
    }

];


// =========================================
// STATE
// =========================================

let currentUser = null;
let currentProfile = null;

let cash = 1000;

let holdings = {};

let prices = {};

let priceHistory = {};

let selectedAsset = null;
let selectedAction = "buy";

let leaderboardUnsubscribe = null;

let marketTimer = null;


// =========================================
// ELEMENTS
// =========================================

const backButton =
    document.getElementById("backButton");

const cashBalance =
    document.getElementById("cashBalance");

const portfolioValue =
    document.getElementById("portfolioValue");

const totalWealth =
    document.getElementById("totalWealth");

const totalPL =
    document.getElementById("totalPL");

const playerName =
    document.getElementById("playerName");

const playerHazelId =
    document.getElementById("playerHazelId");

const marketTime =
    document.getElementById("marketTime");

const assetGrid =
    document.getElementById("assetGrid");

const portfolioEmpty =
    document.getElementById("portfolioEmpty");

const portfolioTableWrap =
    document.getElementById("portfolioTableWrap");

const portfolioTableBody =
    document.getElementById("portfolioTableBody");

const leaderboardList =
    document.getElementById("leaderboardList");

const tradeModal =
    document.getElementById("tradeModal");

const modalBackdrop =
    document.getElementById("modalBackdrop");

const modalClose =
    document.getElementById("modalClose");

const modalIcon =
    document.getElementById("modalIcon");

const modalCategory =
    document.getElementById("modalCategory");

const modalAssetName =
    document.getElementById("modalAssetName");

const modalPrice =
    document.getElementById("modalPrice");

const tradeQuantity =
    document.getElementById("tradeQuantity");

const minusQuantity =
    document.getElementById("minusQuantity");

const plusQuantity =
    document.getElementById("plusQuantity");

const tradeTotal =
    document.getElementById("tradeTotal");

const confirmTrade =
    document.getElementById("confirmTrade");

const tradeNote =
    document.getElementById("tradeNote");

const toast =
    document.getElementById("toast");


// =========================================
// FORMAT
// =========================================

function money(value) {

    return `$${Number(value).toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    )}`;
}


// =========================================
// TOAST
// =========================================

let toastTimer;

function showToast(message) {

    clearTimeout(toastTimer);

    toast.textContent = message;

    toast.classList.add("show");

    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 2200);
}


// =========================================
// AUTH
// =========================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.replace("login.html");

        return;
    }

    currentUser = user;

    try {

        await loadProfile();

        initializeMarket();

        await loadPortfolio();

        renderAssets();

        renderPortfolio();

        updateSummary();

        startMarket();

        listenToLeaderboard();

        document.body.style.visibility = "visible";

    } catch (error) {

        console.error(error);

        showToast(
            "Could not load HAZEL Trading."
        );

        document.body.style.visibility = "visible";
    }

});


// =========================================
// PROFILE
// =========================================

async function loadProfile() {

    const userRef =
        doc(
            db,
            "users",
            currentUser.uid
        );

    const snapshot =
        await getDoc(userRef);


    if (!snapshot.exists()) {

        throw new Error(
            "HAZEL profile not found."
        );
    }


    currentProfile =
        snapshot.data();


    playerName.textContent =
        currentProfile.name ||
        currentUser.displayName ||
        "HAZEL User";


    playerHazelId.textContent =
        currentProfile.hazelId ||
        "";
}


// =========================================
// MARKET
// =========================================

function initializeMarket() {

    ASSETS.forEach(asset => {

        prices[asset.id] =
            asset.initialPrice;

        priceHistory[asset.id] = [
            asset.initialPrice
        ];

    });

}


// =========================================
// LIVE MARKET
// =========================================

function startMarket() {

    updateMarketClock();

    marketTimer =
        setInterval(() => {

            updateMarket();

            updateMarketClock();

        }, 2500);

}


function updateMarketClock() {

    const now = new Date();

    marketTime.textContent =
        now.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );
}


function updateMarket() {

    ASSETS.forEach(asset => {

        const oldPrice =
            prices[asset.id];

        /*
         * Small simulated market movement.
         * This is intentionally virtual.
         */

        const movement =
            (Math.random() - 0.5) *
            0.06;

        let newPrice =
            oldPrice *
            (1 + movement);


        newPrice =
            Math.max(
                1,
                Number(newPrice.toFixed(2))
            );


        prices[asset.id] =
            newPrice;


        priceHistory[asset.id].push(
            newPrice
        );


        if (
            priceHistory[asset.id].length > 30
        ) {

            priceHistory[asset.id].shift();

        }

    });


    renderAssets();

    renderPortfolio();

    updateSummary();
}


// =========================================
// ASSET RENDER
// =========================================

function renderAssets() {

    assetGrid.innerHTML = "";


    ASSETS.forEach(asset => {

        const price =
            prices[asset.id];

        const history =
            priceHistory[asset.id];

        const first =
            history[0] || price;

        const change =
            ((price - first) / first) * 100;


        const direction =
            change >= 0
                ? "up"
                : "down";


        const card =
            document.createElement("article");

        card.className =
            "asset-card";


        card.innerHTML = `

            <div class="asset-top">

                <div class="asset-icon">
                    <i class="fa-solid ${asset.icon}"></i>
                </div>

                <div>
                    <span class="asset-category">
                        ${asset.category}
                    </span>

                    <div class="asset-name">
                        ${asset.name}
                    </div>

                    <div class="asset-symbol">
                        ${asset.symbol}
                    </div>
                </div>

            </div>


            <div class="asset-price">
                ${money(price)}
            </div>

            <div class="asset-change ${direction}">
                <i class="fa-solid ${
                    direction === "up"
                        ? "fa-arrow-trend-up"
                        : "fa-arrow-trend-down"
                }"></i>

                ${change >= 0 ? "+" : ""}
                ${change.toFixed(2)}%
            </div>


            <canvas
                class="mini-chart"
                data-chart="${asset.id}"
            ></canvas>


            <div class="asset-actions">

                <button
                    type="button"
                    class="buy-button"
                    data-action="buy"
                    data-asset="${asset.id}"
                >
                    BUY
                </button>

                <button
                    type="button"
                    class="sell-button"
                    data-action="sell"
                    data-asset="${asset.id}"
                >
                    SELL
                </button>

            </div>
        `;


        assetGrid.appendChild(card);

    });


    assetGrid
        .querySelectorAll("[data-action]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openTradeModal(
                        button.dataset.asset,
                        button.dataset.action
                    );

                }
            );

        });


    drawCharts();
}


// =========================================
// CHARTS
// =========================================

function drawCharts() {

    document
        .querySelectorAll(".mini-chart")
        .forEach(canvas => {

            const assetId =
                canvas.dataset.chart;

            const values =
                priceHistory[assetId] || [];


            const ctx =
                canvas.getContext("2d");


            const width =
                canvas.clientWidth ||
                250;

            const height = 48;

            const dpr =
                window.devicePixelRatio || 1;


            canvas.width =
                width * dpr;

            canvas.height =
                height * dpr;

            ctx.scale(dpr, dpr);

            ctx.clearRect(
                0,
                0,
                width,
                height
            );


            if (values.length < 2) {
                return;
            }


            const min =
                Math.min(...values);

            const max =
                Math.max(...values);

            const range =
                max - min || 1;


            ctx.beginPath();

            values.forEach(
                (value, index) => {

                    const x =
                        (index /
                            (values.length - 1)) *
                        width;

                    const y =
                        height -
                        (
                            (value - min) /
                            range
                        ) *
                        (height - 8) -
                        4;


                    if (index === 0) {

                        ctx.moveTo(x, y);

                    } else {

                        ctx.lineTo(x, y);

                    }

                }
            );


            const first =
                values[0];

            const last =
                values[values.length - 1];


            ctx.strokeStyle =
                last >= first
                    ? "#28d17c"
                    : "#ff5c6c";

            ctx.lineWidth = 1.7;

            ctx.stroke();

        });

}


// =========================================
// PORTFOLIO
// =========================================

async function loadPortfolio() {

    const portfolioRef =
        doc(
            db,
            "tradingPlayers",
            currentUser.uid
        );

    const snapshot =
        await getDoc(portfolioRef);


    if (!snapshot.exists()) {

        cash = 1000;

        holdings = {};

        await savePortfolio();

        return;
    }


    const data =
        snapshot.data();


    cash =
        Number(data.cash ?? 1000);


    holdings =
        data.holdings || {};
}


async function savePortfolio() {

    const portfolioRef =
        doc(
            db,
            "tradingPlayers",
            currentUser.uid
        );


    await setDoc(
        portfolioRef,
        {

            uid:
                currentUser.uid,

            hazelId:
                currentProfile.hazelId,

            name:
                currentProfile.name ||
                "HAZEL User",

            cash:
                Number(cash.toFixed(2)),

            holdings,

            updatedAt:
                serverTimestamp()

        },
        {
            merge: true
        }
    );
}


// =========================================
// PORTFOLIO CALCULATIONS
// =========================================

function calculatePortfolioValue() {

    return Object.entries(holdings)
        .reduce(
            (total, [assetId, holding]) => {

                const quantity =
                    Number(
                        holding.quantity || 0
                    );

                const price =
                    prices[assetId] || 0;

                return total +
                    quantity * price;

            },
            0
        );
}


function calculatePortfolioPL() {

    return Object.entries(holdings)
        .reduce(
            (total, [assetId, holding]) => {

                const quantity =
                    Number(
                        holding.quantity || 0
                    );

                const averageCost =
                    Number(
                        holding.averageCost || 0
                    );

                const currentPrice =
                    prices[assetId] || 0;


                return total +
                    (
                        currentPrice -
                        averageCost
                    ) *
                    quantity;

            },
            0
        );
}


function updateSummary() {

    const portfolio =
        calculatePortfolioValue();

    const wealth =
        cash + portfolio;

    const pl =
        calculatePortfolioPL();


    cashBalance.textContent =
        money(cash);

    portfolioValue.textContent =
        money(portfolio);

    totalWealth.textContent =
        money(wealth);

    totalPL.textContent =
        `${pl >= 0 ? "+" : ""}${money(pl)}`;


    totalPL.className =
        pl >= 0
            ? "pl-positive"
            : "pl-negative";
}


// =========================================
// PORTFOLIO TABLE
// =========================================

function renderPortfolio() {

    const entries =
        Object.entries(holdings)
            .filter(
                ([, holding]) =>
                    Number(holding.quantity || 0) > 0
            );


    if (!entries.length) {

        portfolioEmpty.hidden = false;

        portfolioTableWrap.hidden = true;

        return;
    }


    portfolioEmpty.hidden = true;

    portfolioTableWrap.hidden = false;

    portfolioTableBody.innerHTML = "";


    entries.forEach(
        ([assetId, holding]) => {

            const asset =
                ASSETS.find(
                    item =>
                        item.id === assetId
                );


            if (!asset) return;


            const quantity =
                Number(
                    holding.quantity || 0
                );

            const value =
                quantity *
                (prices[assetId] || 0);


            const pl =
                (
                    (prices[assetId] || 0) -
                    Number(
                        holding.averageCost || 0
                    )
                ) *
                quantity;


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    <strong>
                        ${asset.name}
                    </strong>
                </td>

                <td>
                    ${quantity}
                </td>

                <td>
                    ${money(value)}
                </td>

                <td class="${
                    pl >= 0
                        ? "pl-positive"
                        : "pl-negative"
                }">
                    ${pl >= 0 ? "+" : ""}
                    ${money(pl)}
                </td>
            `;


            portfolioTableBody.appendChild(row);

        }
    );
  }

// =========================================
// TRADE MODAL
// =========================================

function openTradeModal(
    assetId,
    action
) {

    selectedAsset =
        ASSETS.find(
            asset =>
                asset.id === assetId
        );


    if (!selectedAsset) return;


    selectedAction = action;


    modalIcon.innerHTML =
        `<i class="fa-solid ${selectedAsset.icon}"></i>`;


    modalCategory.textContent =
        selectedAsset.category;


    modalAssetName.textContent =
        selectedAsset.name;


    tradeQuantity.value = 1;

    tradeNote.textContent = "";


    confirmTrade.textContent =
        action === "buy"
            ? "BUY"
            : "SELL";


    confirmTrade.style.background =
        action === "buy"
            ? "#2388ff"
            : "#ff5c6c";


    updateTradeModal();


    tradeModal.classList.add("show");

    tradeModal.setAttribute(
        "aria-hidden",
        "false"
    );

}


function closeTradeModal() {

    tradeModal.classList.remove("show");

    tradeModal.setAttribute(
        "aria-hidden",
        "true"
    );

    selectedAsset = null;
}


function updateTradeModal() {

    if (!selectedAsset) return;


    const price =
        prices[selectedAsset.id];


    const quantity =
        Math.max(
            1,
            Number(
                tradeQuantity.value || 1
            )
        );


    const total =
        price * quantity;


    modalPrice.textContent =
        money(price);


    tradeTotal.textContent =
        money(total);


    if (selectedAction === "buy") {

        if (total > cash) {

            tradeNote.textContent =
                "Insufficient virtual cash.";

        } else {

            tradeNote.textContent =
                "";

        }

    } else {

        const owned =
            Number(
                holdings[selectedAsset.id]
                    ?.quantity || 0
            );


        if (quantity > owned) {

            tradeNote.textContent =
                `You only own ${owned} unit${
                    owned === 1 ? "" : "s"
                }.`;

        } else {

            tradeNote.textContent =
                "";

        }

    }

}


// =========================================
// QUANTITY
// =========================================

minusQuantity.addEventListener(
    "click",
    () => {

        const value =
            Math.max(
                1,
                Number(tradeQuantity.value || 1) - 1
            );

        tradeQuantity.value = value;

        updateTradeModal();

    }
);


plusQuantity.addEventListener(
    "click",
    () => {

        const value =
            Math.max(
                1,
                Number(tradeQuantity.value || 1) + 1
            );

        tradeQuantity.value = value;

        updateTradeModal();

    }
);


tradeQuantity.addEventListener(
    "input",
    updateTradeModal
);


// =========================================
// EXECUTE TRADE
// =========================================

confirmTrade.addEventListener(
    "click",
    async () => {

        if (!selectedAsset) return;


        const quantity =
            Math.floor(
                Number(
                    tradeQuantity.value || 0
                )
            );


        if (!Number.isFinite(quantity) ||
            quantity < 1) {

            tradeNote.textContent =
                "Enter a valid quantity.";

            return;
        }


        const price =
            prices[selectedAsset.id];


        const total =
            price * quantity;


        if (selectedAction === "buy") {

            if (total > cash) {

                tradeNote.textContent =
                    "Insufficient virtual cash.";

                return;
            }


            const existing =
                holdings[selectedAsset.id] ||
                {
                    quantity: 0,
                    averageCost: 0
                };


            const oldQuantity =
                Number(existing.quantity);


            const oldCost =
                Number(existing.averageCost);


            const newQuantity =
                oldQuantity + quantity;


            const newAverageCost =
                (
                    (
                        oldQuantity *
                        oldCost
                    ) +
                    (
                        quantity *
                        price
                    )
                ) /
                newQuantity;


            holdings[selectedAsset.id] = {

                quantity:
                    newQuantity,

                averageCost:
                    Number(
                        newAverageCost.toFixed(4)
                    )

            };


            cash -= total;


            await savePortfolio();

            showToast(
                `${quantity} × ${selectedAsset.name} bought`
            );

        } else {

            const existing =
                holdings[selectedAsset.id];


            const owned =
                Number(
                    existing?.quantity || 0
                );


            if (quantity > owned) {

                tradeNote.textContent =
                    `You only own ${owned} unit${
                        owned === 1 ? "" : "s"
                    }.`;

                return;
            }


            cash += total;


            const remaining =
                owned - quantity;


            if (remaining <= 0) {

                delete holdings[
                    selectedAsset.id
                ];

            } else {

                holdings[
                    selectedAsset.id
                ].quantity =
                    remaining;

            }


            await savePortfolio();

            showToast(
                `${quantity} × ${selectedAsset.name} sold`
            );
        }


        closeTradeModal();

        renderPortfolio();

        updateSummary();

    }
);


// =========================================
// MODAL EVENTS
// =========================================

modalClose.addEventListener(
    "click",
    closeTradeModal
);

modalBackdrop.addEventListener(
    "click",
    closeTradeModal
);


// =========================================
// BACK
// =========================================

backButton.addEventListener(
    "click",
    () => {

        window.location.href =
            "hazelgame.html";

    }
);


// =========================================
// LEADERBOARD
// =========================================

function listenToLeaderboard() {

    if (leaderboardUnsubscribe) {

        leaderboardUnsubscribe();

    }


    const playersRef =
        collection(
            db,
            "tradingPlayers"
        );


    leaderboardUnsubscribe =
        onSnapshot(
            playersRef,
            async (snapshot) => {

                const players = [];


                for (
                    const playerDoc
                    of snapshot.docs
                ) {

                    const data =
                        playerDoc.data();


                    const playerPrices =
                        prices;


                    let portfolio =
                        0;


                    Object.entries(
                        data.holdings || {}
                    ).forEach(
                        ([assetId, holding]) => {

                            portfolio +=
                                Number(
                                    holding.quantity || 0
                                ) *
                                Number(
                                    playerPrices[
                                        assetId
                                    ] ||
                                    0
                                );

                        }
                    );


                    const wealth =
                        Number(
                            data.cash || 0
                        ) +
                        portfolio;


                    players.push({

                        uid:
                            playerDoc.id,

                        name:
                            data.name ||
                            "HAZEL User",

                        hazelId:
                            data.hazelId ||
                            "",

                        wealth

                    });

                }


                players.sort(
                    (a, b) =>
                        b.wealth -
                        a.wealth
                );


                renderLeaderboard(
                    players.slice(0, 10)
                );

            },
            (error) => {

                console.error(
                    "Leaderboard error:",
                    error
                );

                leaderboardList.innerHTML = `
                    <div class="loading-row">
                        Leaderboard unavailable.
                    </div>
                `;

            }
        );
}


// =========================================
// LEADERBOARD RENDER
// =========================================

function renderLeaderboard(players) {

    leaderboardList.innerHTML = "";


    if (!players.length) {

        leaderboardList.innerHTML = `
            <div class="loading-row">
                No players yet.
            </div>
        `;

        return;
    }


    players.forEach(
        (player, index) => {

            const row =
                document.createElement("div");

            row.className =
                "leaderboard-row";


            row.innerHTML = `

                <div class="rank">
                    #${index + 1}
                </div>

                <div class="leader-player">

                    <strong>
                        ${escapeHTML(
                            player.name
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            player.hazelId
                        )}
                    </span>

                </div>

                <div class="leader-wealth">
                    ${money(player.wealth)}
                </div>

            `;


            leaderboardList.appendChild(row);

        }
    );
}


// =========================================
// ESCAPE HTML
// =========================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        String(value);

    return div.innerHTML;
}


// =========================================
// CLEANUP
// =========================================

window.addEventListener(
    "beforeunload",
    () => {

        if (marketTimer) {

            clearInterval(marketTimer);

        }

        if (leaderboardUnsubscribe) {

            leaderboardUnsubscribe();

        }

    }
);
