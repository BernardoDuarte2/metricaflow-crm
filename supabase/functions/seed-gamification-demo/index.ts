import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Não autorizado');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Usuário não autenticado');

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!profile) throw new Error('Perfil não encontrado');
    const companyId = profile.company_id;

    // 10 vendedores com fotos reais
    const salespeople = [
      { name: 'Rafael Oliveira', email: `rafael.oliveira.${companyId.slice(0,6)}@demo.com`, avatar_url: 'https://randomuser.me/api/portraits/men/32.jpg' },
      { name: 'Camila Santos', email: `camila.santos.${companyId.slice(0,6)}@demo.com`, avatar_url: 'https://randomuser.me/api/portraits/women/44.jpg' },
      { name: 'Lucas Mendes', email: `lucas.mendes.${companyId.slice(0,6)}@demo.com`, avatar_url: 'https://randomuser.me/api/portraits/men/75.jpg' },
      { name: 'Ana Beatriz Costa', email: `ana.costa.${companyId.slice(0,6)}@demo.com`, avatar_url: 'https://randomuser.me/api/portraits/women/68.jpg' },
      { name: 'Pedro Henrique', email: `pedro.henrique.${companyId.slice(0,6)}@demo.com`, avatar_url: 'https://randomuser.me/api/portraits/men/22.jpg' },
      { name: 'Juliana Ferreira', email: `juliana.ferreira.${companyId.slice(0,6)}@demo.com`, avatar_url: 'https://randomuser.me/api/portraits/women/17.jpg' },
      { name: 'Gabriel Souza', email: `gabriel.souza.${companyId.slice(0,6)}@demo.com`, avatar_url: 'https://randomuser.me/api/portraits/men/45.jpg' },
      { name: 'Mariana Lima', email: `mariana.lima.${companyId.slice(0,6)}@demo.com`, avatar_url: 'https://randomuser.me/api/portraits/women/90.jpg' },
      { name: 'Thiago Almeida', email: `thiago.almeida.${companyId.slice(0,6)}@demo.com`, avatar_url: 'https://randomuser.me/api/portraits/men/56.jpg' },
      { name: 'Isabela Rocha', email: `isabela.rocha.${companyId.slice(0,6)}@demo.com`, avatar_url: 'https://randomuser.me/api/portraits/women/32.jpg' },
    ];

    // Performance config per seller (index = rank)
    const sellerConfigs = [
      { wonLeads: 18, otherLeads: 12, proposals: 8, observations: 30, avgValue: 12000 },
      { wonLeads: 16, otherLeads: 14, proposals: 7, observations: 28, avgValue: 11500 },
      { wonLeads: 14, otherLeads: 10, proposals: 6, observations: 25, avgValue: 10800 },
      { wonLeads: 12, otherLeads: 13, proposals: 5, observations: 22, avgValue: 10200 },
      { wonLeads: 11, otherLeads: 11, proposals: 5, observations: 20, avgValue: 9800 },
      { wonLeads: 10, otherLeads: 12, proposals: 4, observations: 18, avgValue: 9500 },
      { wonLeads: 9, otherLeads: 10, proposals: 4, observations: 16, avgValue: 9200 },
      { wonLeads: 8, otherLeads: 14, proposals: 3, observations: 14, avgValue: 8800 },
      { wonLeads: 7, otherLeads: 8, proposals: 3, observations: 12, avgValue: 8500 },
      { wonLeads: 5, otherLeads: 10, proposals: 2, observations: 10, avgValue: 8000 },
    ];

    const fontes = ['Website', 'Indicação', 'LinkedIn', 'Google Ads', 'WhatsApp', 'Evento'];
    const leadNames = [
      'TechCorp Brasil', 'Innovate Solutions', 'Digital Express', 'CloudBase Inc',
      'DataFlow SA', 'SmartSys Ltda', 'NetPrime Tech', 'CyberEdge Solutions',
      'BlueWave Tech', 'Apex Digital', 'NovaTech SA', 'PrimeLogic Sistemas',
      'CodeHub Brasil', 'InfoBridge IT', 'SkyPoint Cloud', 'RedLine SA',
      'GreenData Analytics', 'FastTrack IT', 'CoreSoft Solutions', 'BrightPath Tech',
      'AlphaNet Sistemas', 'OmegaSys Corp', 'ZetaCloud SA', 'PixelForge Design',
      'StreamBase Tech', 'VoltTech Energia', 'ArcFlow Logística', 'NexGen Consulting',
      'PulseTech Digital', 'QuantumBI Analytics'
    ];
    const otherStatuses = ['novo', 'contato', 'qualificado', 'proposta', 'negociacao', 'perdido'];
    const motivosPerdas = ['Preço muito alto', 'Optou pela concorrência', 'Sem orçamento', 'Projeto cancelado'];

    const userIds: string[] = [];

    // Step 1: Delete old demo leads and users for this company
    // First get existing demo users
    const { data: existingDemoUsers } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('company_id', companyId)
      .neq('id', user.id);

    const demoNames = salespeople.map(s => s.name);
    const oldDemoUserIds = (existingDemoUsers || [])
      .filter(u => demoNames.includes(u.name))
      .map(u => u.id);

    // Delete old leads from demo users
    if (oldDemoUserIds.length > 0) {
      await supabase.from('gamification_events').delete().in('user_id', oldDemoUserIds);
      await supabase.from('lead_observations').delete().in('user_id', oldDemoUserIds);
      
      // Delete lead_values for leads assigned to demo users
      const { data: oldLeads } = await supabase
        .from('leads')
        .select('id')
        .in('assigned_to', oldDemoUserIds);
      
      if (oldLeads && oldLeads.length > 0) {
        const oldLeadIds = oldLeads.map(l => l.id);
        await supabase.from('lead_values').delete().in('lead_id', oldLeadIds);
      }
      
      await supabase.from('leads').delete().in('assigned_to', oldDemoUserIds);
    }

    // Step 2: Create/update users
    for (const person of salespeople) {
      // Check existing by name
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('company_id', companyId)
        .ilike('name', person.name)
        .maybeSingle();

      if (existing) {
        // Update avatar
        await supabase.from('profiles').update({ avatar_url: person.avatar_url }).eq('id', existing.id);
        userIds.push(existing.id);
        console.log(`Updated ${person.name}`);
        continue;
      }

      const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
        email: person.email,
        password: 'Demo@2024!',
        email_confirm: true,
        user_metadata: { name: person.name, company_id: companyId, role: 'vendedor' }
      });

      if (createError) {
        console.error(`Error creating ${person.name}:`, createError);
        continue;
      }

      await supabase.from('profiles').insert({
        id: authUser.user.id,
        company_id: companyId,
        name: person.name,
        avatar_url: person.avatar_url,
        active: true
      });

      await supabase.from('user_roles').insert({
        user_id: authUser.user.id,
        role: 'vendedor'
      });

      userIds.push(authUser.user.id);
      console.log(`Created ${person.name}`);
    }

    if (userIds.length === 0) throw new Error('Nenhum vendedor criado');

    console.log(`${userIds.length} sellers ready. Creating leads and events...`);

    // Step 3: Create leads with sources for each seller
    const now = new Date();
    const allLeadInserts: any[] = [];
    const sellerLeadMap: Record<string, string[]> = {}; // userId -> leadIds (won)

    let leadNameIdx = 0;

    for (let i = 0; i < userIds.length; i++) {
      const config = sellerConfigs[i];
      const userId = userIds[i];

      // Won leads
      for (let w = 0; w < config.wonLeads; w++) {
        const daysAgo = Math.floor(Math.random() * 90);
        const created = new Date(now);
        created.setDate(created.getDate() - daysAgo - 10);
        const updated = new Date(created);
        updated.setDate(updated.getDate() + Math.floor(Math.random() * 10) + 1);
        const value = config.avgValue + Math.floor((Math.random() - 0.5) * 6000);
        
        allLeadInserts.push({
          company_id: companyId,
          name: leadNames[leadNameIdx % leadNames.length] + (leadNameIdx >= leadNames.length ? ` #${Math.floor(leadNameIdx / leadNames.length) + 1}` : ''),
          status: 'ganho',
          assigned_to: userId,
          estimated_value: Math.max(3000, value),
          source: fontes[leadNameIdx % fontes.length],
          created_at: created.toISOString(),
          updated_at: updated.toISOString(),
          qualificado: true,
          _seller_index: i,
          _is_won: true,
        });
        leadNameIdx++;
      }

      // Other leads (non-won, various statuses)
      for (let o = 0; o < config.otherLeads; o++) {
        const daysAgo = Math.floor(Math.random() * 60);
        const created = new Date(now);
        created.setDate(created.getDate() - daysAgo);
        const status = otherStatuses[o % otherStatuses.length];
        const value = 3000 + Math.floor(Math.random() * 15000);

        allLeadInserts.push({
          company_id: companyId,
          name: leadNames[leadNameIdx % leadNames.length] + (leadNameIdx >= leadNames.length ? ` #${Math.floor(leadNameIdx / leadNames.length) + 1}` : ''),
          status,
          assigned_to: userId,
          estimated_value: value,
          source: fontes[leadNameIdx % fontes.length],
          created_at: created.toISOString(),
          updated_at: created.toISOString(),
          qualificado: !['novo', 'contato'].includes(status),
          motivo_perda: status === 'perdido' ? motivosPerdas[o % motivosPerdas.length] : null,
          _seller_index: i,
          _is_won: false,
        });
        leadNameIdx++;
      }
    }

    // Remove internal markers and insert
    const cleanLeadInserts = allLeadInserts.map(({ _seller_index, _is_won, ...rest }) => rest);

    // Insert in batches of 100
    const allLeadIds: { id: string; assigned_to: string; status: string; estimated_value: number }[] = [];
    for (let b = 0; b < cleanLeadInserts.length; b += 100) {
      const batch = cleanLeadInserts.slice(b, b + 100);
      const { data: inserted, error } = await supabase.from('leads').insert(batch).select('id, assigned_to, status, estimated_value');
      if (error) {
        console.error('Lead insert error:', error);
      } else {
        allLeadIds.push(...(inserted || []));
      }
    }

    console.log(`Created ${allLeadIds.length} leads`);

    // Step 4: Create lead_values for won leads
    const wonLeads = allLeadIds.filter(l => l.status === 'ganho');
    const leadValueInserts: any[] = [];
    const valueTypes = [
      { name: 'Setup Inicial', type: 'unico' },
      { name: 'Mensalidade', type: 'recorrente' },
      { name: 'Consultoria', type: 'unico' },
    ];

    for (const lead of wonLeads) {
      const vt = valueTypes[Math.floor(Math.random() * valueTypes.length)];
      leadValueInserts.push({
        lead_id: lead.id,
        company_id: companyId,
        name: vt.name,
        value_type: vt.type,
        amount: lead.estimated_value || 5000,
        created_by: lead.assigned_to,
      });
    }

    if (leadValueInserts.length > 0) {
      for (let b = 0; b < leadValueInserts.length; b += 100) {
        const batch = leadValueInserts.slice(b, b + 100);
        await supabase.from('lead_values').insert(batch);
      }
      console.log(`Created ${leadValueInserts.length} lead values`);
    }

    // Step 5: Create gamification events
    const events: any[] = [];

    for (let i = 0; i < userIds.length; i++) {
      const config = sellerConfigs[i];
      const userId = userIds[i];
      const userWonLeads = wonLeads.filter(l => l.assigned_to === userId);

      // Sale events
      for (let s = 0; s < userWonLeads.length; s++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const d = new Date(now);
        d.setDate(d.getDate() - daysAgo);
        d.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
        events.push({
          user_id: userId,
          event_type: 'sale_closed',
          points: 100,
          lead_id: userWonLeads[s].id,
          metadata: { lead_name: leadNames[s % leadNames.length], estimated_value: userWonLeads[s].estimated_value },
          created_at: d.toISOString(),
        });
      }

      // Lead created events
      const userLeads = allLeadIds.filter(l => l.assigned_to === userId);
      for (let l = 0; l < userLeads.length; l++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const d = new Date(now);
        d.setDate(d.getDate() - daysAgo);
        d.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
        events.push({
          user_id: userId,
          event_type: 'lead_created',
          points: 10,
          lead_id: userLeads[l].id,
          metadata: { lead_name: leadNames[l % leadNames.length] },
          created_at: d.toISOString(),
        });
      }

      // Proposal sent events
      for (let p = 0; p < config.proposals; p++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const d = new Date(now);
        d.setDate(d.getDate() - daysAgo);
        d.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
        events.push({
          user_id: userId,
          event_type: 'proposal_sent',
          points: 30,
          metadata: { lead_name: leadNames[p % leadNames.length] },
          created_at: d.toISOString(),
        });
      }

      // Observation events
      for (let o = 0; o < config.observations; o++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const d = new Date(now);
        d.setDate(d.getDate() - daysAgo);
        d.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
        events.push({
          user_id: userId,
          event_type: 'observation_added',
          points: 5,
          metadata: {},
          created_at: d.toISOString(),
        });
      }
    }

    // Insert events in batches
    let insertedEvents = 0;
    for (let b = 0; b < events.length; b += 500) {
      const batch = events.slice(b, b + 500);
      const { error } = await supabase.from('gamification_events').insert(batch);
      if (error) {
        console.error('Events batch error:', error);
      } else {
        insertedEvents += batch.length;
      }
    }

    console.log(`Inserted ${insertedEvents} gamification events`);

    return new Response(
      JSON.stringify({
        success: true,
        users_created: userIds.length,
        leads_created: allLeadIds.length,
        won_leads: wonLeads.length,
        lead_values_created: leadValueInserts.length,
        events_inserted: insertedEvents,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
