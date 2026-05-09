update public.grammar_patterns
set
  pattern_key = coalesce(pattern_key, lower(title)),
  title_ru = coalesce(title_ru, title),
  affirmative_examples = case
    when jsonb_array_length(affirmative_examples) > 0 then affirmative_examples
    when lower(title) like '%have got%' then '["I have got a dog."]'::jsonb
    when lower(title) = 'can' then '["I can swim."]'::jsonb
    when lower(title) = 'like' then '["I like apples."]'::jsonb
    when lower(title) like '%would like%' then '["I would like some juice."]'::jsonb
    when lower(title) like '%article%' then '["I have got an apple.","The sun is yellow."]'::jsonb
    else affirmative_examples
  end,
  negative_examples = case
    when jsonb_array_length(negative_examples) > 0 then negative_examples
    when lower(title) like '%have got%' then '["I have not got a dog."]'::jsonb
    when lower(title) = 'can' then '["I can not swim."]'::jsonb
    when lower(title) = 'like' then '["I do not like apples."]'::jsonb
    when lower(title) like '%would like%' then '["I would not like juice."]'::jsonb
    else negative_examples
  end,
  question_examples = case
    when jsonb_array_length(question_examples) > 0 then question_examples
    when lower(title) like '%have got%' then '["Have you got a dog?"]'::jsonb
    when lower(title) = 'can' then '["Can you swim?"]'::jsonb
    when lower(title) = 'like' then '["Do you like apples?"]'::jsonb
    when lower(title) like '%would like%' then '["Would you like some juice?"]'::jsonb
    else question_examples
  end,
  short_positive_answers = case
    when jsonb_array_length(short_positive_answers) > 0 then short_positive_answers
    when lower(title) like '%have got%' then '["Yes, I have."]'::jsonb
    when lower(title) = 'can' then '["Yes, I can."]'::jsonb
    when lower(title) = 'like' then '["Yes, I do."]'::jsonb
    when lower(title) like '%would like%' then '["Yes, please."]'::jsonb
    else short_positive_answers
  end,
  short_negative_answers = case
    when jsonb_array_length(short_negative_answers) > 0 then short_negative_answers
    when lower(title) like '%have got%' then '["No, I haven''t."]'::jsonb
    when lower(title) = 'can' then '["No, I can''t."]'::jsonb
    when lower(title) = 'like' then '["No, I don''t."]'::jsonb
    when lower(title) like '%would like%' then '["No, thank you."]'::jsonb
    else short_negative_answers
  end,
  common_mistakes = case
    when jsonb_array_length(common_mistakes) > 0 then common_mistakes
    when lower(title) like '%have got%' then '["Do you have got a dog?"]'::jsonb
    when lower(title) = 'can' then '["Do you can swim?"]'::jsonb
    when lower(title) = 'like' then '["Like you apples?"]'::jsonb
    when lower(title) like '%would like%' then '["Do you would like juice?"]'::jsonb
    when lower(title) like '%article%' then '["a apple","an cat"]'::jsonb
    else common_mistakes
  end,
  exercise_templates = case
    when jsonb_array_length(exercise_templates) > 0 then exercise_templates
    when lower(title) like '%article%' then '[{"type":"articles","prompt":"I have got ___ apple.","answer":"an"}]'::jsonb
    else '[{"type":"question_form"},{"type":"short_answer"}]'::jsonb
  end
where pattern_key is null
   or jsonb_array_length(affirmative_examples) = 0
   or jsonb_array_length(question_examples) = 0
   or jsonb_array_length(short_positive_answers) = 0
   or jsonb_array_length(short_negative_answers) = 0
   or jsonb_array_length(exercise_templates) = 0;
