-- Demo tenant and data. Replace fixed UUIDs only if these clash in your environment.
insert into reward_tenants(id,slug,name,mode,brand) values
('10000000-0000-0000-0000-000000000001','zoryn-network','Zoryn Rewards Network','zoryn_integrated','{"primary":"#0f2f2d","accent":"#d7ff4f","name":"Zoryn Rewards"}'),
('10000000-0000-0000-0000-000000000002','cafe-berlin','Cafe Berlin Loyalty','standalone','{"primary":"#5a2d1f","accent":"#f6c96b","name":"Cafe Berlin Rewards"}')
on conflict do nothing;
insert into reward_programmes(id,tenant_id,name,programme_type,currency,conversion,rules,status) values
('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Universal Zoryn Points','universal','universal_points','{"100_points_value_cents":100}','{"card_points_per_euro":1}','active'),
('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','Zoryn Cashback','cashback','cashback_cents','{"unit":"cent"}','{}','active'),
('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002','Cafe Berlin Points','merchant','merchant_points','{"100_points_value_cents":100}','{"points_per_euro":5}','active')
on conflict do nothing;
insert into reward_merchants(id,tenant_id,name,merchant_group,mcc,provider_merchant_ids,card_match_rules) values
('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Cafe Berlin','Cafe Berlin','5812','{"adyen":"MRC-CB-001","swan_descriptor":"CAFE BERLIN"}','[{"field":"merchant_name","operator":"contains","value":"CAFE BERLIN"}]'),
('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','REWE City','REWE','5411','{}','[{"field":"merchant_name","operator":"contains","value":"REWE"}]')
on conflict do nothing;
insert into reward_campaigns(id,tenant_id,merchant_id,name,campaign_type,trigger_rules,reward_rules,budget,status,starts_at,ends_at) values
('40000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','Cafe Berlin 5x','earn','{"minimum_amount_cents":500}','{"points_per_euro":5,"wallet":"universal"}','{"funding":"merchant"}','active',now()-interval '30 day',now()+interval '365 day'),
('40000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001',null,'Zoryn Card Base Reward','earn','{"source":"card","minimum_amount_cents":100}','{"points_per_euro":1,"wallet":"universal"}','{"funding":"interchange"}','active',now()-interval '30 day',now()+interval '365 day')
on conflict do nothing;
