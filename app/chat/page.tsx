import type { Metadata } from 'next';
import ChatClient from './ChatClient';

export const metadata: Metadata = {
  title: '权益问答',
  description: '外卖骑手劳动权益信息助手，基于法规数据回答扣款、工伤、劳动关系等问题。',
};

export default function ChatPage() {
  return <ChatClient />;
}