import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Category = 'idoso' | 'pcd';
export type Status = 'Pendente' | 'Aprovado';

export interface Registration {
  id: string;
  name: string;
  phone: string;
  mobile: string;
  email: string;
  idNumber: string;
  birthDate: string;
  category: Category;
  address: {
    cep: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  hasCompanion: boolean;
  status: Status;
  createdAt: string;
}

export interface EventDay {
  id: string;
  date: string;
  weekday: string;
  totalSpots: number;
  approvedCount: number;
  waitingListCount: number;
  attractions: string[];
  image: string;
}

interface AppStore {
  registrations: Registration[];
  eventDays: EventDay[];
  addRegistration: (reg: Omit<Registration, 'id' | 'status' | 'createdAt'>) => void;
  updateRegistrationStatus: (id: string, status: Status) => void;
  deleteRegistration: (id: string) => void;
  addEventDay: (day: Omit<EventDay, 'id' | 'approvedCount' | 'waitingListCount'>) => void;
  updateEventDay: (id: string, day: Partial<EventDay>) => void;
  deleteEventDay: (id: string) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      registrations: [
        {
          id: '1',
          name: 'João da Silva',
          phone: '(81) 3333-4444',
          mobile: '(81) 98888-7777',
          email: 'joao@email.com',
          idNumber: '123.456.789-00',
          birthDate: '1950-05-15',
          category: 'idoso',
          address: {
            cep: '50000-000',
            street: 'Rua das Flores',
            number: '123',
            neighborhood: 'Centro',
            city: 'Arcoverde',
            state: 'PE',
          },
          hasCompanion: true,
          status: 'Aprovado',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Maria Oliveira',
          phone: '(81) 3222-1111',
          mobile: '(81) 99999-0000',
          email: 'maria@email.com',
          idNumber: '987.654.321-11',
          birthDate: '1985-10-20',
          category: 'pcd',
          address: {
            cep: '56500-000',
            street: 'Av. Principal',
            number: '456',
            neighborhood: 'Boa Vista',
            city: 'Arcoverde',
            state: 'PE',
          },
          hasCompanion: false,
          status: 'Pendente',
          createdAt: new Date().toISOString(),
        },
      ],
      eventDays: [
        {
          id: '1',
          date: '22/06',
          weekday: 'Sábado',
          totalSpots: 100,
          approvedCount: 85,
          waitingListCount: 12,
          attractions: ['Alceu Valença', 'Flávio José'],
          image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=400&auto=format&fit=crop',
        },
        {
          id: '2',
          date: '23/06',
          weekday: 'Domingo',
          totalSpots: 100,
          approvedCount: 98,
          waitingListCount: 45,
          attractions: ['Elba Ramalho', 'Mastruz com Leite'],
          image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=400&auto=format&fit=crop',
        },
        {
          id: '3',
          date: '24/06',
          weekday: 'Segunda',
          totalSpots: 100,
          approvedCount: 60,
          waitingListCount: 0,
          attractions: ['Santanna', 'Jorge de Altinho'],
          image: 'https://images.unsplash.com/photo-1514525253361-b87486637504?q=80&w=400&auto=format&fit=crop',
        },
      ],
      addRegistration: (reg) => set((state) => ({
        registrations: [
          ...state.registrations,
          {
            ...reg,
            id: Math.random().toString(36).substr(2, 9),
            status: 'Pendente',
            createdAt: new Date().toISOString(),
          },
        ],
      })),
      updateRegistrationStatus: (id, status) => set((state) => ({
        registrations: state.registrations.map((r) => r.id === id ? { ...r, status } : r),
      })),
      deleteRegistration: (id) => set((state) => ({
        registrations: state.registrations.filter((r) => r.id !== id),
      })),
      addEventDay: (day) => set((state) => ({
        eventDays: [
          ...state.eventDays,
          {
            ...day,
            id: Math.random().toString(36).substr(2, 9),
            approvedCount: 0,
            waitingListCount: 0,
          },
        ],
      })),
      updateEventDay: (id, updatedDay) => set((state) => ({
        eventDays: state.eventDays.map((d) => d.id === id ? { ...d, ...updatedDay } : d),
      })),
      deleteEventDay: (id) => set((state) => ({
        eventDays: state.eventDays.filter((d) => d.id !== id),
      })),
    }),
    {
      name: 'sao-joao-storage',
    }
  )
);

