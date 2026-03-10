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

    // 10 salespeople
    const salespeople = [
      { name: 'Rafael Oliveira', email: `rafael.oliveira.${companyId.slice(0,6)}@demo.com`, avatar_url: 'https://i.pravatar.cc/150?img=12' },
      { name: 'Camila Santos', email: `camila.santos.${companyId.slice(0,6)}@demo.com`, avatar_url: 'https://i.pravatar.cc/150?img=5' },
      { name: 'Lucas Mendes', email: `lucas.mendes.${companyId.slice(0,6)}@demo.com`, avatar_url: 'https://i.pravatar.cc/150?img=11' },
      { name: 'Ana Beatriz Costa', email: `ana.costa.${companyId.slice(0,6)}@demo.com`, avatar_url: 'https://i.pravatar.cc/150?img=9' },
      { name: 'Pedro Henrique', email: `pedro.henrique.${companyId.slice(0,6)}@demo.com`, avatar_url: 'https://i.pravatar.cc/150?img=14' },
      { name: 'Juliana Ferreira', email: `juliana.ferreira.${companyId.slice(0,6)}@demo.com`, avatar_url: 'https://i.pravatar.cc/150?img=20' },
      { name: 'Gabriel Souza', email: `gabriel.souza.${companyId.slice(0,6)}@demo.com`, avatar_url: 'https://i.pravatar.cc/150?img=53' },
      { name: 'Mariana Lima', email: `mariana.lima.${companyId.slice(0,6)}@demo.com`, avatar_url: 'https://i.pravatar.cc/150?img=45' },
      { name: 'Thiago Almeida', email: `thiago.almeida.${companyId.slice(0,6)}@demo.com`, avatar_url: 'https://i.pravatar.cc/150?img=60' },
      { name: 'Isabela Rocha', email: `isabela.rocha.${companyId.slice(0,6)}@demo.com`, avatar_url: 'https://i.pravatar.cc/150?img=25' },
    ];

    // Sales configs per seller (index = rank position roughly)
    const sellerConfigs = [
      { sales: 28, leads: 67, proposals: 45, observations: 30, avgValue: 10200 },
      { sales: 26, leads: 58, proposals: 40, observations: 35, avgValue: 11900 },
      { sales: 24, leads: 63, proposals: 42, observations: 28, avgValue: 10200 },
      { sales: 21, leads: 52, proposals: 38, observations: 25, avgValue: 9400 },
      { sales: 19, leads: 53, proposals: 35, observations: 22, avgValue: 9200 },
      { sales: 17, leads: 50, proposals: 32, observations: 20, avgValue: 9500 },
      { sales: 15, leads: 47, proposals: 30, observations: 18, avgValue: 9800 },
      { sales: 14, leads: 46, proposals: 28, observations: 16, avgValue: 9400 },
      { sales: 12, leads: 43, proposals: 25, observations: 14, avgValue: 9500 },
      { sales: 10, leads: 38, proposals: 22, observations: 12, avgValue: 9800 },
    ];

    const userIds: string[] = [];

    // Create users
    for (const person of salespeople) {
      // Check existing
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('company_id', companyId)
        .ilike('name', person.name)
        .maybeSingle();

      if (existing) {
        userIds.push(existing.id);
        console.log(`${person.name} already exists`);
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

    console.log(`${userIds.length} users ready, seeding gamification events...`);

    // Clear old gamification events for these users
    if (userIds.length > 0) {
      await supabase.from('gamification_events').delete().in('user_id', userIds);
    }

    // Create leads for the company first
    const leadNames = [
      'TechCorp Brasil', 'Innovate Solutions', 'Digital Express', 'CloudBase Inc',
      'DataFlow SA', 'SmartSys', 'NetPrime', 'CyberEdge', 'BlueWave Tech',
      'Apex Digital', 'NovaTech', 'PrimeLogic', 'CodeHub', 'InfoBridge',
      'SkyPoint', 'RedLine SA', 'GreenData', 'FastTrack IT', 'CoreSoft',
      'BrightPath', 'AlphaNet', 'OmegaSys', 'ZetaCloud', 'PixelForge',
      'StreamBase', 'VoltTech', 'ArcFlow', 'NexGen', 'PulseTech', 'QuantumBI'
    ];

    // Insert leads
    const leadInserts = leadNames.map((name, i) => ({
      company_id: companyId,
      name,
      status: i < 15 ? 'ganho' : ['novo', 'contato', 'proposta', 'negociacao'][i % 4],
      assigned_to: userIds[i % userIds.length],
      estimated_value: 5000 + Math.floor(Math.random() * 25000),
      source: ['site', 'indicacao', 'linkedin', 'evento', 'telefone'][i % 5],
    }));

    const { data: leads } = await supabase.from('leads').insert(leadInserts).select('id');
    const leadIds = leads?.map(l => l.id) || [];

    // Generate gamification events spread over last 30 days
    const now = new Date();
    const events: any[] = [];

    for (let i = 0; i < userIds.length; i++) {
      const config = sellerConfigs[i];
      const userId = userIds[i];

      // Sale events
      for (let s = 0; s < config.sales; s++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const d = new Date(now);
        d.setDate(d.getDate() - daysAgo);
        d.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
        const value = config.avgValue + Math.floor((Math.random() - 0.5) * 6000);
        events.push({
          user_id: userId,
          event_type: 'sale_closed',
          points: 100,
          lead_id: leadIds[s % leadIds.length] || null,
          metadata: { lead_name: leadNames[s % leadNames.length], estimated_value: value },
          created_at: d.toISOString(),
        });
      }

      // Lead created events
      for (let l = 0; l < config.leads; l++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const d = new Date(now);
        d.setDate(d.getDate() - daysAgo);
        d.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
        events.push({
          user_id: userId,
          event_type: 'lead_created',
          points: 10,
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

    // Insert events in batches of 500
    let inserted = 0;
    for (let b = 0; b < events.length; b += 500) {
      const batch = events.slice(b, b + 500);
      const { error } = await supabase.from('gamification_events').insert(batch);
      if (error) {
        console.error(`Batch error:`, error);
      } else {
        inserted += batch.length;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        users_created: userIds.length,
        events_inserted: inserted,
        leads_created: leadIds.length,
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
