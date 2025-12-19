const fs = require('fs'); 
const lines = fs.readFileSync('supabase/schema.sql','utf8').split(/\r?\n/); 
lines.forEach((line,i)=
