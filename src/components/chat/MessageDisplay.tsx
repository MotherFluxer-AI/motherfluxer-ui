/**
 * @ai-context: Renders chat messages with sender-specific styling and layout
 * @ai-dependencies: Message type from global types
 * @ai-critical-points: Must maintain message order and handle different sender types
 *
 * LEARNING POINTS:
 * 1. Implements bidirectional chat layout
 * 2. Uses conditional styling based on sender
 */

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

/**
 * @ai-function: Message display component properties
 * @ai-requires: Array of valid Message objects
 * @ai-affects: Chat message visualization
 */
interface MessageDisplayProps {
  messages: Message[];
}

export const MessageDisplay: React.FC<MessageDisplayProps> = ({ messages }) => {
  /**
   * @ai-function: Renders message list with sender-specific styling
   * @ai-requires: Valid messages array with sender information
   * @ai-affects: Visual presentation of chat history
   */
  return (
    <div className="flex flex-col space-y-4 p-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.sender === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[70%] rounded-lg p-3 ${
              message.sender === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            {message.content}
          </div>
        </div>
      ))}
    </div>
  );
}; 