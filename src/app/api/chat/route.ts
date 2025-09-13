import { convertToModelMessages, stepCountIs, streamText, UIMessage } from "ai";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { experimental_createMCPClient as createMCPClient } from "ai";
import { tool } from "ai";
import z from "zod";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { getOrCreatePurchaserAccount, getSolanaNetwork } from "@/lib/solana-accounts";
import { env } from "@/lib/env";

export const maxDuration = 30;

// Function to get the appropriate AI model based on available credentials
function getAIModel(modelString: string) {
  // Check if we have AI Gateway token (Vercel AI Gateway)
  if (env.AI_GATEWAY_TOKEN) {
    return modelString; // Use the model string directly with AI Gateway
  }
  
  // Check for direct provider credentials
  if (env.OPENAI_API_KEY && modelString.includes("openai")) {
    return openai(modelString.replace("openai/", ""));
  }
  
  if (env.ANTHROPIC_API_KEY && modelString.includes("anthropic")) {
    return anthropic(modelString.replace("anthropic/", ""));
  }
  
  if (env.GOOGLE_GENERATIVE_AI_API_KEY && modelString.includes("google")) {
    return google(modelString.replace("google/", ""));
  }
  
  // Fallback: throw an error with helpful message
  throw new Error(
    "No AI provider configured. Please set one of: OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY, or AI_GATEWAY_TOKEN in your environment variables."
  );
}

export const POST = async (request: Request) => {
  try {
    const { messages, model }: { messages: UIMessage[]; model: string } =
      await request.json();

    const account = await getOrCreatePurchaserAccount();
    const network = getSolanaNetwork();

    // For now, we'll create a basic MCP client without payment integration
    // since x402-mcp doesn't support Solana yet
    const mcpClient = await createMCPClient({
      transport: new StreamableHTTPClientTransport(new URL("/mcp", env.URL)),
    });

    const tools = await mcpClient.tools();

    const result = streamText({
      model: getAIModel(model),
      tools: {
        ...tools,
        "hello-local": tool({
          description: "Receive a greeting",
          inputSchema: z.object({
            name: z.string(),
          }),
          execute: async (args) => {
            return `Hello ${args.name}`;
          },
        }),
        "solana-info": tool({
          description: "Get Solana network and account information",
          inputSchema: z.object({}),
          execute: async () => {
            return `Connected to Solana network: ${network}\nAccount: ${account.publicKey.toString()}`;
          },
        }),
      },
      messages: convertToModelMessages(messages),
      stopWhen: stepCountIs(5),
      onFinish: async () => {
        await mcpClient.close();
      },
      system: "You are connected to Solana network. You can use tools to interact with the blockchain. ALWAYS prompt the user to confirm before authorizing payments.",
    });
    
    return result.toUIMessageStreamResponse({
      sendSources: true,
      sendReasoning: true,
      messageMetadata: () => ({ network }),
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An error occurred",
        hint: "Make sure you have configured AI provider credentials in your .env.local file"
      }), 
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
};
