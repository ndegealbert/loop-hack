"use client";

import { useState } from "react";
import axios from "axios";
import { Send, TrendingUp, Sparkles, PiggyBank, CreditCard, Wallet, Users, Bell } from "lucide-react";

export default function LoopNexusMVP() {
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text:
        "Hey! 👋 I'm Loop Nexus, your lifestyle finance buddy. Life's expensive, but we'll figure it out together. What's on your mind?",
      options: [
        "Moving Out",
        "Getting Married",
        "Buying My First Car",
        "Building Credit",
        "Starting a Side Hustle",
        "Going Back to School",
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [currentFlow, setCurrentFlow] = useState(null);
  const [userData, setUserData] = useState({});
  const [showActions, setShowActions] = useState(false);

  // ---- Loop Sandbox API (Axios) ----
  const LOOP_GET_USER_DETAIL_URL =
    "https://sandbox.loop.co.ke/gateway/LoopSendMoney/1.0/openapi/getUserDetail.djson";

  // WARNING: token is hard-coded for demo; do NOT ship secrets to the client in production.
  const LOOP_BEARER_TOKEN =
    "eyJ4NXQiOiJPREJtTVRVMFpqSmpPREprTkdZMVpUaG1ZamsyWVRZek56UmpZekl6TVRCbFlqRTBNV0prWTJJeE5qZzNPRGRqWVdRNVpXWmhOV0kwTkRBM1pqTTROUSIsImtpZCI6Ik9EQm1NVFUwWmpKak9ESmtOR1kxWlRobVlqazJZVFl6TnpSall6SXpNVEJsWWpFME1XSmtZMkl4TmpnM09EZGpZV1E1WldaaE5XSTBOREEzWmpNNE5RX1JTMjU2IiwidHlwIjoiYXQrand0IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiI0ZmIzN2U0Zi0xMmI5LTQwZDktYTNkOC05ZDFlMzk5OWY0YjkiLCJhdXQiOiJBUFBMSUNBVElPTiIsImF1ZCI6Im4yT1l3R1N3TG5zT0s3WWRpUWxKMlNROXdKUWEiLCJuYmYiOjE3NTk1MjcwMjcsImF6cCI6Im4yT1l3R1N3TG5zT0s3WWRpUWxKMlNROXdKUWEiLCJzY29wZSI6ImRlZmF1bHQiLCJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo5NDQzL29hdXRoMi90b2tlbiIsImV4cCI6MTc1OTUzMDYyNywiaWF0IjoxNzU5NTI3MDI3LCJqdGkiOiI5Y2E3YzllOC1lZDAwLTRlZTctYjU0Yy0yMjI1YWQ1MTBhNTkiLCJjbGllbnRfaWQiOiJuMk9Zd0dTd0xuc09LN1lkaVFsSjJTUTl3SlFhIn0.zNsw3bZQu-bba1sVNeduzGuMKNJQ9z7la02do8saAjgeRxZtSA7_B_AjIk3m641G2mRt1Dzfg-mB9Qk18jWr0yQmLORGxjliEFPji3DLjplzCxqdUE-fL-AKK-4DWev5EHe-NUFJPDZNlfh1mqIk-yltiFvyKA9yJthYMUO9z3-_DTCPQAcJFTwMWhYqX9aXtrRBnYdVKR4Aq7FBMFAaeUn3ZjBiiT7M0gPbdYa_qBsqXjO4_Gc0z6BsJCL0zXXEMlsLd_-_JFh8OWBJ767BIEHXCsZMNKoLaLwLtJ4ud92LHDLWTPeLKg1cYTcgnyFsgjnUPPrYAMa202-ahIJ8dw";

  const getUserDetail = async (mobileNo = "254727596412") => {
    try {
      const res = await axios.post(
        LOOP_GET_USER_DETAIL_URL,
        { mobileNo },
        {
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${LOOP_BEARER_TOKEN}`,
          },
          timeout: 15000,
        }
      );
      return res.data;
    } catch (err) {
      // Bubble up a normalized error
      const msg =
        err?.response?.data?.rspMessage ||
        err?.message ||
        "Failed to reach Loop API";
      throw new Error(msg);
    }
  };

  // --- Currency helpers (KES) ---
  const formatKES = (val) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);

  const parseNumber = (v) => {
    const n = typeof v === "string" ? v.replace(/[^\d.]/g, "") : v;
    return Number(n) || 0;
  };

  const conversationFlows = {
    "Moving Out": [
      { question: "First place? That's huge! 🏠 Where are you moving to?", field: "location", type: "text" },
      { question: "What's your budget for rent per month?", field: "rentBudget", type: "number", prefix: "KSh" },
      {
        question: "How much do you have saved for the move? (deposit, furniture, etc.)",
        field: "saved",
        type: "number",
        prefix: "KSh",
      },
      {
        question: "Are you moving in with roommates?",
        field: "roommates",
        type: "options",
        options: ["Yes, splitting costs", "No, solo", "With my partner"],
      },
      { question: "What's your current monthly income after taxes?", field: "monthlyIncome", type: "number", prefix: "KSh" },
    ],
    "Getting Married": [
      { question: "Congrats! 🎉 When's the big day?", field: "weddingDate", type: "text" },
      {
        question: "What's your wedding budget? (be real, weddings are expensive 😅)",
        field: "budget",
        type: "number",
        prefix: "KSh",
      },
      { question: "How much have you saved so far?", field: "saved", type: "number", prefix: "KSh" },
      {
        question: "Are you DIY-ing anything to save money?",
        field: "diy",
        type: "options",
        options: ["Yes, a lot!", "A few things", "Nope, hiring pros"],
      },
      {
        question: "Have you talked about money stuff with your partner yet?",
        field: "financialDiscussion",
        type: "options",
        options: ["Yeah, we're on it", "Started the convo", "Avoiding that talk 😬"],
      },
    ],
    "Buying My First Car": [
      {
        question: "Nice! What kind of car are you looking at?",
        field: "carType",
        type: "options",
        options: ["New car", "Used car", "Certified pre-owned", "Still deciding"],
      },
      { question: "What's your budget?", field: "budget", type: "number", prefix: "KSh" },
      { question: "How much can you put down?", field: "downPayment", type: "number", prefix: "KSh" },
      { question: "Are you financing or paying cash?", field: "financing", type: "options", options: ["Financing", "Cash", "Not sure yet"] },
      {
        question: "Have you factored in insurance, fuel, and maintenance costs?",
        field: "otherCosts",
        type: "options",
        options: ["Yes", "Kind of", "Not really 😅"],
      },
    ],
    "Building Credit": [
      { question: "Smart move! Do you have a credit card yet?", field: "hasCreditCard", type: "options", options: ["Yes", "No", "Had one, messed it up"] },
      { question: "What's your credit score goal?", field: "creditGoal", type: "options", options: ["700+", "750+", "Just want to build it", "Don't know my current score"] },
      { question: "Are you paying any bills in your name? (rent, utilities, phone, etc.)", field: "bills", type: "options", options: ["Yes, several", "One or two", "Not yet"] },
      { question: "What's your main reason for building credit?", field: "reason", type: "options", options: ["Buy a car", "Get an apartment", "Future home", "Better interest rates"] },
      { question: "Can you pay your full balance every month?", field: "payFull", type: "options", options: ["Yes", "Most of it", "Struggling with that"] },
    ],
    "Starting a Side Hustle": [
      { question: "Let's get that bag! 💰 What kind of side hustle?", field: "hustleType", type: "text" },
      { question: "How much do you need to get started?", field: "startupCost", type: "number", prefix: "KSh" },
      { question: "How much have you saved for this?", field: "saved", type: "number", prefix: "KSh" },
      { question: "When do you want to launch?", field: "timeline", type: "options", options: ["ASAP", "In 1-3 months", "3-6 months", "Just exploring"] },
      { question: "What's your income goal from this side hustle?", field: "incomeGoal", type: "options", options: ["KSh 75k–150k/month", "KSh 150k–300k/month", "KSh 300k+/month", "Whatever I can get"] },
    ],
    "Going Back to School": [
      { question: "Love it! What are you studying?", field: "program", type: "text" },
      { question: "What's the total tuition?", field: "budget", type: "number", prefix: "KSh" },
      { question: "How much can you pay out of pocket?", field: "saved", type: "number", prefix: "KSh" },
      { question: "Will you be working while in school?", field: "working", type: "options", options: ["Full-time", "Part-time", "Not working", "Online gigs"] },
      { question: "Have you looked into scholarships or financial aid?", field: "aid", type: "options", options: ["Yes, applied", "Looking into it", "Don't know where to start"] },
    ],
  };

  const handleOptionClick = (option) => {
    const userMessage = { type: "user", text: option };
    setMessages((prev) => [...prev, userMessage]);

    if (!currentFlow) {
      setCurrentFlow(option);
      const flow = conversationFlows[option];
      if (flow && flow.length > 0) {
        setTimeout(() => {
          const nextQuestion = flow[0];
          addBotMessage(nextQuestion);
        }, 500);
      }
    } else {
      processAnswer(option);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const userMessage = { type: "user", text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    processAnswer(inputValue);
    setInputValue("");
  };

  const processAnswer = (answer) => {
    const flow = conversationFlows[currentFlow];
    const currentQuestionIndex = Object.keys(userData).length;
    const currentQuestion = flow[currentQuestionIndex];

    if (currentQuestion) {
      const newUserData = { ...userData, [currentQuestion.field]: answer };
      setUserData(newUserData);

      if (currentQuestionIndex + 1 < flow.length) {
        setTimeout(() => {
          const nextQuestion = flow[currentQuestionIndex + 1];
          addBotMessage(nextQuestion);
        }, 500);
      } else {
        setTimeout(() => {
          showSummary(newUserData);
        }, 500);
      }
    }
  };

  const addBotMessage = (question) => {
    const botMessage = {
      type: "bot",
      text: question.question,
      options: question.options || null,
      inputType: question.type,
      prefix: question.prefix,
    };
    setMessages((prev) => [...prev, botMessage]);
  };

  const showSummary = (data) => {
    const summaryMessage = {
      type: "bot",
      text: generateSummary(data),
      isSummary: true,
    };
    setMessages((prev) => [...prev, summaryMessage]);
    setShowActions(true);
  };

  const generateSummary = (data) => {
    const budget = parseNumber(data.budget ?? data.rentBudget ?? data.startupCost ?? 0);
    const saved = parseNumber(data.saved ?? data.downPayment ?? 0);
    const remaining = budget - saved;
    const percentage = budget > 0 ? Math.round((saved / budget) * 100) : 0;

    let summary = `Alright, here's the deal 📊\n\n`;

    if (budget && saved >= 0) {
      summary += `💰 Goal: ${formatKES(budget)}\n`;
      summary += `✅ You've got: ${formatKES(saved)} (${percentage}%)\n`;
      summary += `📈 Still need: ${formatKES(remaining)}\n\n`;
    }

    summary += `Here's what I'm thinking:\n\n`;

    if (currentFlow === "Moving Out") {
      const rent = parseNumber(data.rentBudget ?? 0);
      const income = parseNumber(data.monthlyIncome ?? 0);
      const rentPercent = income > 0 ? Math.round((rent / income) * 100) : 0;

      if (rentPercent > 30) {
        summary += `⚠️ Your rent is ${rentPercent}% of income - try to keep it under 30%\n`;
      }
      summary += `💡 Budget for utilities, internet, groceries (~${formatKES(15000)}–${formatKES(25000)}/month)\n`;
      summary += `📦 Consider second-hand furniture to save\n`;
      summary += `🔒 Renter's insurance if applicable\n`;
      if (data.roommates === "No, solo") {
        summary += `💸 Flying solo means higher costs - make sure your emergency fund is solid\n`;
      }
    } else if (currentFlow === "Getting Married") {
      summary += `🎊 Remember: your budget is yours — spend where it matters to you\n`;
      if (data.diy === "Yes, a lot!" || data.diy === "A few things") {
        summary += `👏 DIY can save serious money\n`;
      }
      summary += `💳 Use a separate savings pot just for wedding expenses\n`;
    } else if (currentFlow === "Buying My First Car") {
      if (data.carType === "New car") {
        summary += `🤔 Consider certified pre-owned — similar warranty, lower price\n`;
      }
      summary += `🚗 Budget for insurance, fuel & maintenance (set aside ${formatKES(15000)}–${formatKES(30000)}/month)\n`;
      if (data.financing === "Financing") {
        summary += `💳 Shop around for rates; bigger deposit reduces monthly cost\n`;
      }
      if (data.otherCosts === "Not really 😅") {
        summary += `⚠️ The sticker price is just the start — total cost is higher!\n`;
      }
    } else if (currentFlow === "Building Credit") {
      if (data.hasCreditCard === "No") summary += `💳 Start with a secured card from your bank\n`;
      if (data.hasCreditCard === "Had one, messed it up") summary += `🔄 Recoverable: focus on on-time payments\n`;
      summary += `✅ Pay the full balance monthly\n`;
      summary += `📊 Keep utilization under 30% (10% is better)\n`;
      summary += `🚫 Don't close old cards — age matters\n`;
      if (data.payFull === "Struggling with that") summary += `⚠️ If you can't pay in full, scale back spending\n`;
    } else if (currentFlow === "Starting a Side Hustle") {
      summary += `🚀 Keep your day job while you build this\n`;
      if (saved < budget) summary += `💰 Save up your startup money first — avoid debt if you can\n`;
      summary += `📊 Track every expense for taxes\n`;
      summary += `💼 Separate business account for clarity\n`;
      if (data.incomeGoal && data.incomeGoal.includes("300k+")) {
        summary += `🎯 Solid goal — give it 6–12 months of consistent effort\n`;
      }
    } else if (currentFlow === "Going Back to School") {
      summary += `🎓 Look for scholarships/bursaries and flexible payment plans\n`;
      if (data.aid === "Don't know where to start") {
        summary += `🔍 Check your institution’s financial aid office and trusted scholarship boards\n`;
      }
      if (data.working !== "Not working") {
        summary += `💼 Working while studying is tough but doable — manage your time tightly\n`;
      }
    }

    summary += `\n✨ Ready to take action?`;
    return summary;
  };

  const handleAPIAction = async (action) => {
    const budget = parseNumber(userData.budget ?? userData.rentBudget ?? userData.startupCost ?? 0);
    const saved = parseNumber(userData.saved ?? userData.downPayment ?? 0);
    const remaining = budget - saved;

    let actionMessage = "";

    if (action === "deposit") {
      actionMessage = `📲 Opening deposit interface...\n\nYou can deposit any amount toward your ${currentFlow} goal of ${formatKES(budget)}.\n\nConnecting to Loop Deposit API...`;
    } else if (action === "loan") {
      actionMessage = `💳 Opening loan request...\n\nBased on your needs, you might want to borrow ${formatKES(remaining)}.\n\nConnecting to Loop Loan Request API...`;
    } else if (action === "split") {
      actionMessage = `👥 Opening payment splitter...\n\nPerfect for splitting costs with roommates or friends!\n\nConnecting to Loop Send Money API...`;
    } else if (action === "mpesa") {
      actionMessage = `📱 Opening M-Pesa payment...\n\nDeposit directly from your M-Pesa account.\n\nConnecting to Loop Pay to M-Pesa API...`;
    } else if (action === "notifications") {
      actionMessage = `🔔 Setting up payment notifications...\n\nYou'll get instant alerts when:\n- Deposits are received\n- Loan payments are due\n- Goal milestones are reached\n\nConnecting to Loop IPN Registration API...`;
    }

    if (action && action !== "balance") {
      const botMessage = { type: "bot", text: actionMessage, isAction: true };
      setMessages((prev) => [...prev, botMessage]);
      setShowActions(false);
      setTimeout(() => {
        const followUpMessage = {
          type: "bot",
          text: "✅ All set! Want to explore another goal or need help with something else?",
          options: ["Start Over", "Track My Progress", "Get More Tips"],
        };
        setMessages((prev) => [...prev, followUpMessage]);
      }, 2000);
      return;
    }

    // ---- Live Balance via Axios ----
    if (action === "balance") {
      setShowActions(false);
      const loadingMsg = { type: "bot", text: "📊 Checking your balance… Connecting to Loop…", isAction: true };
      setMessages((prev) => [...prev, loadingMsg]);

      try {
        // Optional: if you later collect mobile number, use userData.mobileNo here.
        const data = await getUserDetail("254727596412");

        if (data?.rspCode === "00000000") {
          const walletAva = data.walletAvaBal ?? data.walletAccBal ?? "0";
          const bankAva = data.bankAvaBal ?? data.bankAccBal ?? "0";
          const fullName = [data.firstName, data.secondName, data.lastName].filter(Boolean).join(" ");

          const successMsg = {
            type: "bot",
            text:
              `✅ Balance fetched successfully for ${fullName || "your account"}\n\n` +
              `🪪 User No: ${data.usrNo}\n` +
              `👤 KYC Level: ${data.kycLvl}\n` +
              `\n💼 Wallet Available: ${formatKES(walletAva)}\n` +
              `🏦 Bank Available: ${formatKES(bankAva)}\n` +
              `\n⏱️ Server Time: ${data.serverTime}\n` +
              `\nWant to do something next?`,
            options: ["Start Over", "Get More Tips"],
          };
          setMessages((prev) => [...prev, successMsg]);
        } else {
          const errMsg = {
            type: "bot",
            text:
              `⚠️ Could not fetch balance.\n` +
              `Code: ${data?.rspCode || "Unknown"}\n` +
              `Message: ${data?.rspMessage || "No message provided"}`,
          };
          setMessages((prev) => [...prev, errMsg]);
        }
      } catch (e) {
        const failMsg = { type: "bot", text: `❌ Error: ${e.message}` };
        setMessages((prev) => [...prev, failMsg]);
      }
    }
  };

  const handleFollowUp = (option) => {
    if (option === "Start Over") {
      setMessages([messages[0]]);
      setCurrentFlow(null);
      setUserData({});
      setShowActions(false);
    } else if (option === "Track My Progress") {
      handleAPIAction("balance");
    } else {
      const tipsMessage = {
        type: "bot",
        text:
          `💡 Pro Tips:\n\n` +
          `✅ Automate transfers to your savings\n` +
          `✅ Use a simple 50/30/20 rule: 50% needs, 30% wants, 20% savings\n` +
          `✅ Track your spending\n` +
          `✅ Build an emergency fund (3–6 months expenses)\n` +
          `✅ Start investing early, even if it's just ${formatKES(5000)}/month\n\n` +
          `Want to plan for another goal?`,
        options: ["Yes, let's go!", "No, I'm good"],
      };
      setMessages((prev) => [...prev, { type: "user", text: option }, tipsMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const lastMessage = messages[messages.length - 1];
  const showOptions = lastMessage?.type === "bot" && lastMessage?.options;
  const showInput = lastMessage?.type === "bot" && (lastMessage?.inputType === "text" || lastMessage?.inputType === "number");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Loop Nexus</h1>
              <p className="text-xs text-gray-500">Your Lifestyle Financial Assistant</p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {messages.map((message, idx) => (
              <div key={idx} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] ${
                    message.type === "user"
                      ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                      : "bg-white border border-gray-200 rounded-2xl rounded-tl-sm shadow-sm"
                  } p-4`}
                >
                  {message.type === "bot" && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-medium text-purple-600">Loop</span>
                    </div>
                  )}
                  <p className={`text-sm whitespace-pre-line ${message.type === "user" ? "text-white" : "text-gray-900"}`}>
                    {message.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-white sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {showOptions && !showActions && (
            <div className="flex flex-wrap gap-2 mb-4">
              {lastMessage.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (["Start Over", "Track My Progress", "Get More Tips", "Yes, let's go!", "No, I'm good"].includes(option)) {
                      handleFollowUp(option);
                    } else {
                      handleOptionClick(option);
                    }
                  }}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium text-sm transition border border-blue-200"
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {showActions && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Take Action:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <button
                  onClick={() => handleAPIAction("deposit")}
                  className="flex items-center gap-2 p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-green-700 font-medium text-sm transition"
                >
                  <PiggyBank className="w-5 h-5" />
                  Deposit Money
                </button>
                <button
                  onClick={() => handleAPIAction("loan")}
                  className="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-700 font-medium text-sm transition"
                >
                  <CreditCard className="w-5 h-5" />
                  Request Loan
                </button>
                <button
                  onClick={() => handleAPIAction("balance")}
                  className="flex items-center gap-2 p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-purple-700 font-medium text-sm transition"
                >
                  <Wallet className="w-5 h-5" />
                  Check Balance
                </button>
                <button
                  onClick={() => handleAPIAction("split")}
                  className="flex items-center gap-2 p-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg text-orange-700 font-medium text-sm transition"
                >
                  <Users className="w-5 h-5" />
                  Split Payment
                </button>
                <button
                  onClick={() => handleAPIAction("mpesa")}
                  className="flex items-center gap-2 p-3 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg text-yellow-700 font-medium text-sm transition"
                >
                  <Send className="w-5 h-5" />
                  Pay via M-Pesa
                </button>
                <button
                  onClick={() => handleAPIAction("notifications")}
                  className="flex items-center gap-2 p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-700 font-medium text-sm transition"
                >
                  <Bell className="w-5 h-5" />
                  Set Alerts
                </button>
              </div>
            </div>
          )}

          {showInput && (
            <div className="flex gap-2">
              <div className="flex-1 relative">
                {lastMessage.prefix && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">{lastMessage.prefix}</span>
                )}
                <input
                  type={lastMessage.inputType === "number" ? "number" : "text"}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={lastMessage.inputType === "number" ? "Enter amount" : "Type your answer..."}
                  className={`w-full ${lastMessage.prefix ? "pl-14" : "pl-4"} pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
