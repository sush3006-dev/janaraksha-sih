"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

type Message = {
  role: "user" | "model";
  text: string;
};

const supportTopics = [
  {
    title: "I Feel Unsafe or Threatened",
    description:
      "Get guidance if someone is threatening, intimidating, or making you feel unsafe.",
    icon: "◉",
  },
  {
    title: "Harassment or Abuse",
    description:
      "Understand your options for harassment, stalking, bullying, or abusive behaviour.",
    icon: "◌",
  },
  {
    title: "Women Safety",
    description:
      "Get guidance related to harassment, safety concerns, domestic abuse, or support.",
    icon: "♙",
  },
  {
    title: "I'm Afraid to Report",
    description:
      "Explore your options if fear, pressure, retaliation, or reputation concerns are stopping you.",
    icon: "◍",
  },
  {
    title: "Blackmail or Coercion",
    description:
      "Understand what you can do if someone is pressuring, blackmailing, or forcing you.",
    icon: "◉",
  },
  {
    title: "Cyber Harassment",
    description:
      "Get help with online threats, cyber bullying, impersonation, fraud, or digital abuse.",
    icon: "▣",
  },
  {
    title: "Other Legal Concern",
    description:
      "Ask about any other legal issue or concern you need help with.",
    icon: "⚖",
  },
];

export default function AISupportPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  function handleTopicClick(title: string) {
    setMessage(`I need help regarding: ${title}`);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    const userMessage: Message = {
      role: "user",
      text: trimmedMessage,
    };

    const updatedMessages = [
      ...messages,
      userMessage,
    ];

    setMessages(updatedMessages);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai-support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to get AI response."
        );
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "model",
          text: data.reply,
        },
      ]);
    } catch (error) {
      console.error("AI Support error:", error);

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "model",
          text:
            "I'm sorry, I couldn't process your request right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleNewChat() {
    setMessages([]);
    setMessage("");
  }

  const hasMessages = messages.length > 0;

  return (
    <main className="dashboard">
      <Sidebar activeItem="AI Support" />

      <section className="dashboard-content ai-support-page">
        <DashboardHeader
          title="AI Support"
          description="Get guidance and support whenever you need it."
        />

        <div className="ai-support-container">

          {/* CHAT HEADER */}
          <div className="ai-chat-topbar">
            <div className="ai-chat-identity">
              <div className="ai-chat-avatar">
                ✦
              </div>

              <div>
                <strong>JanaRaksha AI</strong>
                <span>
                  General legal & safety support
                </span>
              </div>
            </div>

            {hasMessages && (
              <button
                type="button"
                className="ai-new-chat-button"
                onClick={handleNewChat}
              >
                + New Chat
              </button>
            )}
          </div>

          {/* CHAT AREA */}
          <div className="ai-chat-area">

            {!hasMessages ? (
              <div className="ai-chat-welcome">

                <div className="ai-chat-welcome-icon">
                  ✦
                </div>

                <h2>
                  How can I help you?
                </h2>

                <p>
                  I'm JanaRaksha AI. You can ask me about
                  safety concerns, harassment, cybercrime,
                  complaints, evidence, or general legal
                  guidance.
                </p>

                <div className="ai-chat-disclaimer">
                  <span>♢</span>
                  <span>
                    AI provides general information and does
                    not replace professional legal advice.
                  </span>
                </div>

                {/* TOPICS */}
                <div className="ai-support-topic-grid">
                  {supportTopics.map((topic) => (
                    <button
                      key={topic.title}
                      type="button"
                      className="ai-support-topic-card"
                      onClick={() =>
                        handleTopicClick(topic.title)
                      }
                    >
                      <div className="ai-topic-icon">
                        {topic.icon}
                      </div>

                      <div className="ai-topic-content">
                        <strong>
                          {topic.title}
                        </strong>

                        <p>
                          {topic.description}
                        </p>
                      </div>

                      <span className="ai-topic-arrow">
                        →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="ai-message-list">
                {messages.map((item, index) => (
                  <div
                    key={`${item.role}-${index}`}
                    className={`ai-message-row ${
                      item.role === "user"
                        ? "ai-user-row"
                        : "ai-model-row"
                    }`}
                  >
                    {item.role === "model" && (
                      <div className="ai-message-avatar">
                        ✦
                      </div>
                    )}

                    <div
                      className={`ai-message-bubble ${
                        item.role === "user"
                          ? "ai-user-bubble"
                          : "ai-model-bubble"
                      }`}
                    >
                      {item.text}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="ai-message-row ai-model-row">
                    <div className="ai-message-avatar">
                      ✦
                    </div>

                    <div className="ai-message-bubble ai-model-bubble ai-typing">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* INPUT */}
          <section className="ai-question-section">
            <form onSubmit={handleSubmit}>
              <div className="ai-question-box">
                <textarea
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey
                    ) {
                      event.preventDefault();

                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                  placeholder="Ask JanaRaksha AI anything..."
                  rows={2}
                  disabled={loading}
                />

                <div className="ai-question-footer">
                  <span className="ai-input-hint">
                    Enter to send · Shift + Enter for new line
                  </span>

                  <button
                    type="submit"
                    className="ai-send-button"
                    disabled={
                      loading || !message.trim()
                    }
                  >
                    {loading ? (
                      "Thinking..."
                    ) : (
                      <>
                        <span>➤</span>
                        Send
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}