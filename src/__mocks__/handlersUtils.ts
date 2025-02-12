import { http, HttpResponse } from 'msw';

import { server } from '../setupTests';
import { Event } from '../types';

const EVENTS_ENDPOINT = '/api/events';

// ! Hard 여기 제공 안함
export const setupMockHandlers = (initEvents: Event[] = []) => {
  let mockEvents = [...initEvents];

  server.use(
    /**
     * GET /api/events
     */
    http.get(EVENTS_ENDPOINT, () => {
      return HttpResponse.json({ events: mockEvents });
    }),

    /**
     * POST /api/events
     */
    http.post(EVENTS_ENDPOINT, async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      newEvent.id = `${mockEvents.length + 1}`;

      mockEvents = [...mockEvents, newEvent];

      return HttpResponse.json(newEvent, { status: 201 });
    }),

    /**
     * PUT /api/events/:id
     */
    http.put(`${EVENTS_ENDPOINT}/:id`, async ({ params, request }) => {
      const { id } = params;
      const modifiedEvent = (await request.json()) as Event;
      const index = mockEvents.findIndex((event) => event.id === id);

      mockEvents[index] = { ...mockEvents[index], ...modifiedEvent };

      return index !== -1
        ? HttpResponse.json(modifiedEvent, { status: 201 })
        : new HttpResponse(null, { status: 404 });
    }),

    /**
     * DELETE /api/events/:id
     */
    http.delete(`${EVENTS_ENDPOINT}/:id`, ({ params }) => {
      const index = mockEvents.findIndex((event) => event.id === params.id);

      mockEvents = mockEvents.filter((event) => event.id !== params.id);

      return index !== -1
        ? new HttpResponse(null, { status: 204 })
        : new HttpResponse(null, { status: 404 });
    })
  );
};

export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  const mockEvents: Event[] = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      newEvent.id = String(mockEvents.length + 1); // 간단한 ID 생성
      mockEvents.push(newEvent);
      return HttpResponse.json(newEvent, { status: 201 });
    })
  );
};

export const setupMockHandlerUpdating = () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0, exceptions: [] },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '기존 회의2',
      date: '2024-10-15',
      startTime: '11:00',
      endTime: '12:00',
      description: '기존 팀 미팅 2',
      location: '회의실 C',
      category: '업무 회의',
      repeat: { type: 'none', interval: 0, exceptions: [] },
      notificationTime: 5,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const updatedEvent = (await request.json()) as Event;
      const index = mockEvents.findIndex((event) => event.id === id);

      mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
      return HttpResponse.json(mockEvents[index]);
    })
  );
};

export const setupMockHandlerDeletion = () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '삭제할 이벤트',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '삭제할 이벤트입니다',
      location: '어딘가',
      category: '기타',
      repeat: { type: 'none', interval: 0, exceptions: [] },
      notificationTime: 10,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      const index = mockEvents.findIndex((event) => event.id === id);

      mockEvents.splice(index, 1);
      return new HttpResponse(null, { status: 204 });
    })
  );
};
