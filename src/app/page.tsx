"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputButton,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Response } from "@/components/ai-elements/response";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";

import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Loader } from "@/components/ai-elements/loader";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";

const models = [
  {
    name: "GPT 4o",
    value: "openai/gpt-4o",
  },
  {
    name: "Gemini 2.0 Flash Lite",
    value: "google/gemini-2.0-flash-lite",
  },
];
const suggestions = {
  "🔍 Check Solana account": "Get my Solana account information.",
  "💰 Test x402 payment": "Test x402 payment functionality with $0.01 USDC.",
  "🎲 Generate random number": "Generate a random number between 1 and 100.",
  "👋 Say hello": "Please greet me with 'hello-remote' by the name: 'user'",
};

const ChatBotDemo = () => {
  const [input, setInput] = useState("");
  const [model, setModel] = useState<string>(models[0].value);
  const [aiConfigError, setAiConfigError] = useState<string | null>(null);
  
  const { messages, sendMessage, status } = useChat({
    onError: (error) => {
      console.error(error);
      // Check if it's an AI configuration error
      if (error.message.includes("No AI provider configured")) {
        setAiConfigError(error.message);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(
        { text: input },
        {
          body: {
            model: model,
          },
        }
      );
      setInput("");
    }
  };

  const handleSuggestionClick = (suggestion: keyof typeof suggestions) => {
    sendMessage(
      { text: suggestions[suggestion] },
      {
        body: {
          model: model,
        },
      }
    );
  };

  return (
    <div className="w-full p-6 relative size-full max-w-4xl mx-auto">
      <div className="flex flex-col h-full">
        {/* AI Configuration Error Banner */}
        {aiConfigError && (
          <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-orange-500 text-xl">⚠️</div>
              <div className="flex-1">
                <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                  AI Configuration Required
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                  To use the chat functionality, you need to configure an AI provider. Add one of these to your <code className="bg-orange-100 dark:bg-orange-800 px-1 rounded">.env.local</code> file:
                </p>
                <div className="bg-orange-100 dark:bg-orange-800/50 p-3 rounded text-xs font-mono text-orange-800 dark:text-orange-200">
                  <div># Option 1: OpenAI (Recommended for testing)</div>
                  <div>OPENAI_API_KEY=your-key-here</div>
                  <div className="mt-2"># Option 2: AI Gateway (Recommended for production)</div>
                  <div>AI_GATEWAY_TOKEN=your-token-here</div>
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                  Get OpenAI API key from: <a href="https://platform.openai.com/api-keys" target="_blank" className="underline">platform.openai.com/api-keys</a>
                </p>
              </div>
            </div>
          </div>
        )}

        {messages.length === 0 && (
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full text-sm font-medium text-purple-700 dark:text-purple-300 mb-4">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              x402 Solana Integration Active
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Welcome to x402 AI Starter Kit
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
              Experience the future of AI payments with Solana blockchain. Test x402 payment protocols, 
              interact with MCP tools, and explore decentralized AI interactions.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="text-2xl mb-2">🔗</div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Solana Integration</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Real x402 payments on Solana devnet with automatic SOL airdrop</p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="text-2xl mb-2">🤖</div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">AI Tools</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">MCP server with Solana account management and payment testing</p>
              </div>
            </div>
          </div>
        )}
        
        <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {message.parts.map((part, i) => {
                    if (part.type === "text") {
                      return (
                        <Response key={`${message.id}-${i}`}>
                          {part.text}
                        </Response>
                      );
                    } else if (part.type === "reasoning") {
                      return (
                        <Reasoning
                          key={`${message.id}-${i}`}
                          className="w-full"
                          isStreaming={status === "streaming"}
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );
                    } else if (
                      part.type === "dynamic-tool" ||
                      part.type.startsWith("tool-")
                    ) {
                      return (
                        <Tool defaultOpen={true} key={`${message.id}-${i}`}>
                          {/* @ts-expect-error */}
                          <ToolHeader part={part} />
                          <ToolContent>
                            {/* @ts-expect-error */}
                            <ToolInput input={part.input} />
                            <ToolOutput
                              // @ts-expect-error
                              part={part}
                              // @ts-expect-error
                              network={message.metadata?.network}
                            />
                          </ToolContent>
                        </Tool>
                      );
                    } else {
                      return null;
                    }
                  })}
                </MessageContent>
              </Message>
            ))}
            {status === "submitted" && <Loader />}
            {status === "error" && <div>Something went wrong</div>}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <Suggestions className="justify-center">
          {Object.keys(suggestions).map((suggestion) => (
            <Suggestion
              key={suggestion}
              suggestion={suggestion}
              onClick={() =>
                handleSuggestionClick(suggestion as keyof typeof suggestions)
              }
              variant="outline"
              size="sm"
            />
          ))}
        </Suggestions>

        <PromptInput onSubmit={handleSubmit} className="mt-4">
          <PromptInputTextarea
            onChange={(e) => setInput(e.target.value)}
            value={input}
            ref={(ref) => {
              if (ref) {
                ref.focus();
              }
            }}
          />
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputModelSelect
                onValueChange={(value) => {
                  setModel(value);
                }}
                value={model}
              >
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map((model) => (
                    <PromptInputModelSelectItem
                      key={model.value}
                      value={model.value}
                    >
                      {model.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit disabled={!input} status={status} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};

export default ChatBotDemo;
