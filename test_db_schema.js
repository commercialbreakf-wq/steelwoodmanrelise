require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function run() {
  console.log("Supabase URL:", process.env.SUPABASE_URL);
  
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .limit(1);
    
  if (orderError) {
    console.error("Orders Error:", orderError);
  } else {
    console.log("Orders columns:", orderData.length > 0 ? Object.keys(orderData[0]) : "No data");
    console.log("Sample order:", orderData[0]);
  }

  const { data: leadData, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .limit(1);

  if (leadError) {
    console.error("Leads Error:", leadError);
  } else {
    console.log("Leads columns:", leadData.length > 0 ? Object.keys(leadData[0]) : "No data");
    console.log("Sample lead:", leadData[0]);
  }
}

run();
