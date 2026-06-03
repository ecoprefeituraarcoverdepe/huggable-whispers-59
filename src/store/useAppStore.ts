import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';

export type Category = 'idoso' | 'pcd' | 'ambos';
export type Status = 'Pendente' | 'Aprovado' | 'Reprovado';

export interface Registration {
  id: string;
  name: string;
  phone: string | null;
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
  eventDayId: string | null;
  registrationCode?: string | null;
  documentUrl?: string | null;
  disabilityCode?: string | null;
  pcdName?: string | null;
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
  lastRegistrationCode: string | null;
  lastEventDayId: string | null;
  addRegistration: (reg: Omit<Registration, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  updateRegistrationStatus: (id: string, status: Status) => Promise<void>;
  deleteRegistration: (id: string) => Promise<void>;
  addEventDay: (day: Omit<EventDay, 'id' | 'approvedCount' | 'waitingListCount'>, imageFile?: File) => Promise<void>;
  updateEventDay: (id: string, day: Partial<EventDay>, imageFile?: File) => Promise<void>;
  deleteEventDay: (id: string) => Promise<void>;
  resetAll: () => Promise<void>;
  fetchData: () => Promise<void>;
  setLastRegistration: (code: string | null, eventDayId: string | null) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      registrations: [],
      eventDays: [],
      isLoading: false,
      lastRegistrationCode: null,
      lastEventDayId: null,

      setLastRegistration: (code, eventDayId) => set({ 
        lastRegistrationCode: code,
        lastEventDayId: eventDayId
      }),

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
              cep: r.address_cep || '',
              street: r.address_street || '',
              number: r.address_number || '',
              neighborhood: r.address_neighborhood || '',
              city: r.address_city || '',
              state: r.address_state || '',
            },
            status: r.status as Status,
            createdAt: r.created_at || '',
            eventDayId: r.event_day_id,
            registrationCode: r.registration_code,
            documentUrl: r.document_url,
            disabilityCode: r.disability_code,
            pcdName: r.pcd_name,
          }));

          const formattedDays: EventDay[] = daysResponse.data.map(d => {
            let weekday = '';
            let totalSpots = 100;
            let attractions: string[] = [];
            let image = '';

            try {
              if (d.description && d.description.startsWith('{')) {
                const extra = JSON.parse(d.description);
                weekday = extra.weekday || '';
                totalSpots = extra.totalSpots || 100;
                attractions = extra.attractions || [];
                image = extra.image || '';
              } else if (d.description) {
                attractions = [d.description];
              }
            } catch (e) {
              console.error('Error parsing event description:', e);
              attractions = [d.description];
            }

            return {
              id: d.id,
              date: d.date,
              weekday,
              totalSpots,
              approvedCount: formattedRegs.filter(r => r.eventDayId === d.id && r.status === 'Aprovado').length,
              waitingListCount: formattedRegs.filter(r => r.eventDayId === d.id && r.status === 'Pendente').length,
              attractions,
              image: image || "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=400&auto=format&fit=crop",
              description: d.description
            };
          });

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
          phone: data.phone || null,
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
          address_state: data.address.state || 'PE',
          event_day_id: data.eventDayId,
          registration_code: (data as any).registrationCode,
          document_url: (data as any).documentUrl,
          disability_code: (data as any).disabilityCode,
          pcd_name: (data as any).pcdName,
          needs_transportation: (data as any).needsTransportation || false,
          emergency_phone: (data as any).emergencyPhone || null,
          companion_name: (data as any).companionName || null,
          companion_phone: (data as any).companionPhone || null,
        });

        if (error) {
          console.error("Supabase insert error:", error);
          if (error.code === '23505') {
            throw new Error("Este CPF/RG já possui uma inscrição realizada.");
          }
          throw error;
        }
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

      addEventDay: async (day, imageFile) => {
        let imageUrl = day.image;

        if (imageFile) {
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('event-images')
            .upload(filePath, imageFile);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('event-images')
            .getPublicUrl(filePath);
          
          imageUrl = publicUrl;
        }

        const { error } = await supabase.from('event_days').insert({
          date: day.date,
          description: JSON.stringify({
            weekday: day.weekday,
            totalSpots: day.totalSpots,
            attractions: day.attractions,
            image: imageUrl
          })
        });
        if (error) throw error;
        await get().fetchData();
      },

      updateEventDay: async (id, day, imageFile) => {
        const currentDay = get().eventDays.find(d => d.id === id);
        let imageUrl = day.image ?? currentDay?.image;

        if (imageFile) {
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('event-images')
            .upload(filePath, imageFile);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('event-images')
            .getPublicUrl(filePath);
          
          imageUrl = publicUrl;
        }

        const description = JSON.stringify({
          weekday: day.weekday ?? currentDay?.weekday,
          totalSpots: day.totalSpots ?? currentDay?.totalSpots,
          attractions: day.attractions ?? currentDay?.attractions,
          image: imageUrl
        });

        const { error } = await supabase.from('event_days').update({
          date: day.date,
          description
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