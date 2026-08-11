-- Optional seed examples for public.words / public.idioms
-- After running schema.sql, you can paste rows like these in SQL Editor.
-- Until tables have data, the app keeps using data/words.json + data/idioms.json.

insert into public.words (id, term, phonetic, definition, example)
values
  (
    'w_example_resilient',
    'resilient',
    '/rɪˈzɪliənt/',
    'Able to recover quickly from difficulties.',
    'She stayed resilient after the setback.'
  )
on conflict (id) do update
set
  term = excluded.term,
  phonetic = excluded.phonetic,
  definition = excluded.definition,
  example = excluded.example,
  updated_at = now();

insert into public.idioms (id, term, category, definition, example)
values
  (
    'i_example_break_the_ice',
    'break the ice',
    'Daily Life',
    'To start a conversation and make people feel more comfortable.',
    'He told a joke to break the ice at the meeting.'
  )
on conflict (id) do update
set
  term = excluded.term,
  category = excluded.category,
  definition = excluded.definition,
  example = excluded.example,
  updated_at = now();
