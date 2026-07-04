import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Force this route to always run as a dynamic server-side handler
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Instantiate inside handler so it runs at request-time, not build-time
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages 배열이 필요합니다.' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `당신은 친절하고 격려적인 AI 수학 튜터입니다. 초등학생부터 고등학생까지 다양한 수준의 학생들이 수학 질문을 합니다.
          
다음 원칙에 따라 답변해 주세요:
1. 한국어로 답변하며, 쉽고 친근한 언어를 사용하세요.
2. 수식은 마크다운 형식으로 깔끔하게 표현하고, 단계별로 풀이를 설명해 주세요.
3. 정답만 주는 것보다, 학생이 스스로 생각할 수 있도록 유도하는 방식으로 설명하세요.
4. 격려와 응원의 말을 적절히 섞어 학생이 수학에 자신감을 갖도록 도와주세요.
5. 수학과 무관한 질문에는 정중하게 "수학 관련 질문에 답변해 드릴 수 있어요!"라고 안내하세요.
6. 회전체, 다각형, 함수 등 기하학과 대수학 개념을 특히 잘 설명해 주세요.
7. 답변은 너무 길지 않게 (300자 이내로) 핵심을 전달하되, 복잡한 문제는 충분히 설명해 주세요.`,
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const reply = completion.choices[0]?.message?.content || '죄송해요, 답변을 생성하지 못했어요.';

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('OpenAI API Error:', error);

    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'API 키가 유효하지 않습니다. OPENAI_API_KEY 환경 변수를 확인해 주세요.' },
        { status: 401 }
      );
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' },
      { status: 500 }
    );
  }
}
