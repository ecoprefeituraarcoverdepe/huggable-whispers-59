import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';

export type Category = 'idoso' | 'pcd';
export type Status = 'Pendente' | 'Aprovado' | 'Reprovado';

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
  description?: string;
}

interface AppStore {
  registrations: Registration[];
  eventDays: EventDay[];
  isLoading: boolean;
  addRegistration: (reg: Omit<Registration, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  updateRegistrationStatus: (id: string, status: Status) => Promise<void>;
  deleteRegistration: (id: string) => Promise<void>;
  addEventDay: (day: Omit<EventDay, 'id' | 'approvedCount' | 'waitingListCount'>) => Promise<void>;
  updateEventDay: (id: string, day: Partial<EventDay>) => Promise<void>;
  deleteEventDay: (id: string) => Promise<void>;
  resetAll: () => Promise<void>;
  fetchData: () => Promise<void>;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      registrations: [],
      eventDays: [],
      isLoading: false,

      fetchData: async () => {
        set({ isLoading: true });
        try {
          const [regsResponse, daysResponse] = await Promise.all([
            supabase.from('registrations').select('*').order('created_at', { ascending: false }),
            supabase.from('event_days').select('*').order('date', { ascending: true })
          ]);

          if (regsResponse.error) throw regsResponse.error;
          if (daysResponse.error) throw daysResponse.error;

          const formattedRegs: Registration[] = regsResponse.data.map(r => ({
            id: r.id,
            name: r.name,
            email: r.email,
            phone: r.phone,
            mobile: r.mobile,
            idNumber: r.id_number,
            birthDate: r.birth_date,
            category: r.category as Category,
            hasCompanion: r.has_companion || false,
            address: {
              cep: r.address_cep,
              street: r.address_street,
              number: r.address_number,
              neighborhood: r.address_neighborhood,
              city: r.address_city,
              state: r.address_state,
            },
            status: r.status as Status,
            createdAt: r.created_at || '',
          }));

          const formattedDays: EventDay[] = daysResponse.data.map(d => ({
            id: d.id,
            date: d.date,
            description: d.description,
            weekday: '', // Placeholder since DB schema is simpler
            totalSpots: 100,
            approvedCount: 0,
            waitingListCount: 0,
            attractions: [],
            image: ''
          }));

          set({ registrations: formattedRegs, eventDays: formattedDays });
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      addRegistration: async (data) => {
        const { error } = await supabase.from('registrations').insert({
          name: data.name,
          email: data.email,
          phone: data.phone,
          mobile: data.mobile,
          id_number: data.idNumber,
          birth_date: data.birthDate,
          category: data.category,
          has_companion: data.hasCompanion,
          address_cep: data.address.cep,
          address_street: data.address.street,
          address_number: data.address.number,
          address_neighborhood: data.address.neighborhood,
          address_city: data.address.city,
          address_state: data.address.state,
        });

        if (error) throw error;
        await get().fetchData();
      },

      updateRegistrationStatus: async (id, status) => {
        const { error } = await supabase
          .from('registrations')
          .update({ status })
          .eq('id', id);

        if (error) throw error;
        await get().fetchData();
      },

      deleteRegistration: async (id) => {
        const { error } = await supabase.from('registrations').delete().eq('id', id);
        if (error) throw error;
        await get().fetchData();
      },

      addEventDay: async (day) => {
        const { error } = await supabase.from('event_days').insert({
          date: day.date,
          description: day.description || day.attractions.join(', ')
        });
        if (error) throw error;
        await get().fetchData();
      },

      updateEventDay: async (id, day) => {
        const { error } = await supabase.from('event_days').update({
          date: day.date,
          description: day.description || (day.attractions ? day.attractions.join(', ') : undefined)
        }).eq('id', id);
        if (error) throw error;
        await get().fetchData();
      },

      deleteEventDay: async (id) => {
        const { error } = await supabase.from('event_days').delete().eq('id', id);
        if (error) throw error;
        await get().fetchData();
      },

      resetAll: async () => {
        const { error: errorRegs } = await supabase.from('registrations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        const { error: errorDays } = await supabase.from('event_days').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        
        if (errorRegs) console.error('Error resetting registrations:', errorRegs);
        if (errorDays) console.error('Error resetting days:', errorDays);
        
        await get().fetchData();
      },
    }),
    {
      name: 'sao-joao-storage',
    }
  )
);
