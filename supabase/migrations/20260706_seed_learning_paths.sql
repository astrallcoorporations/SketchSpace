do $$
declare
  path_def jsonb;
  unit_def jsonb;
  lesson_def jsonb;
  v_path_id uuid;
  v_unit_id uuid;
  paths jsonb := $paths$[
    {"slug":"drawing-fundamentals","title":"Drawing Fundamentals","icon":"Pencil","description":"Lines, shapes, and the observational habits every other path builds on.",
     "units":[
       {"title":"Seeing Like an Artist","lessons":[
         {"title":"Contour lines","difficulty":"beginner","xp":10,"description":"Draw what you see, not what you think you see.","content":"Pick any object near you. Without lifting your pen, trace its outline in one continuous line while looking only at the object, not your paper. This retrains your hand to follow your eyes."},
         {"title":"Basic shapes","difficulty":"beginner","xp":10,"description":"Every complex form breaks down into spheres, cubes, and cylinders.","content":"Sketch 10 everyday objects using only circles, squares, and cylinders as your starting scaffolding before adding detail."},
         {"title":"Line weight & confidence","difficulty":"beginner","xp":15,"description":"Confident lines read better than shaky, repeated ones.","content":"Practice drawing straight lines and circles in one confident stroke, from the shoulder rather than the wrist. Repetition beats caution."}
       ]},
       {"title":"Value & Form","lessons":[
         {"title":"Value scales","difficulty":"beginner","xp":15,"description":"Learn to see and reproduce a full range of light to dark.","content":"Draw a 10-step value scale from white to black using only pencil hatching. This is your calibration tool for every shaded drawing after this."},
         {"title":"Shading spheres","difficulty":"intermediate","xp":20,"description":"The sphere is the hardest solid to shade convincingly — master it first.","content":"Draw three circles and shade each as a sphere under a different light direction: front-lit, side-lit, and backlit."},
         {"title":"Cast shadows","difficulty":"intermediate","xp":20,"description":"Shadows anchor objects to the ground plane.","content":"Add a light source and ground plane to your sphere studies, and draw the cast shadow each object would produce."}
       ]}
     ]},
    {"slug":"perspective","title":"Perspective","icon":"Box","description":"One, two, and three-point perspective for believable space.",
     "units":[
       {"title":"One-Point Perspective","lessons":[
         {"title":"The horizon line & vanishing point","difficulty":"beginner","xp":10,"description":"Every perspective drawing starts with these two things.","content":"Draw a horizon line and a single vanishing point. Draw a simple box receding toward it using only lines that converge on that point."},
         {"title":"Interior room in 1-point","difficulty":"intermediate","xp":20,"description":"Apply one-point perspective to a full interior space.","content":"Draw a simple room — floor, walls, ceiling — all converging to one vanishing point on the back wall."},
         {"title":"A street in 1-point","difficulty":"intermediate","xp":20,"description":"Buildings receding down a street share one vanishing point.","content":"Draw a street scene with buildings on both sides converging toward a single vanishing point on the horizon."}
       ]},
       {"title":"Two-Point Perspective","lessons":[
         {"title":"Two vanishing points","difficulty":"intermediate","xp":20,"description":"Most everyday objects are seen at an angle, not head-on.","content":"Draw a horizon line with two vanishing points, one on each side. Draw a box with two visible faces converging correctly to each point."},
         {"title":"A building exterior","difficulty":"advanced","xp":30,"description":"Combine multiple 2-point boxes into a believable structure.","content":"Draw a building using stacked and combined boxes, all respecting the same two vanishing points."}
       ]}
     ]},
    {"slug":"anatomy","title":"Anatomy","icon":"PersonStanding","description":"The skeleton and muscle structure behind believable figures.",
     "units":[
       {"title":"Proportions & Gesture","lessons":[
         {"title":"The 8-head figure","difficulty":"beginner","xp":10,"description":"A standard proportion system to measure any figure against.","content":"Draw a simple standing figure using head-height as your unit of measurement — 8 heads tall is the common idealized proportion."},
         {"title":"Gesture drawing","difficulty":"beginner","xp":15,"description":"Capture the flow and energy of a pose before the detail.","content":"Do five 60-second gesture sketches focusing only on the line of action through the spine — no detail, just movement."},
         {"title":"The rib cage & pelvis","difficulty":"intermediate","xp":20,"description":"These two masses drive every believable torso.","content":"Simplify the torso into two blocks — rib cage and pelvis — connected by the spine, and draw them twisting against each other."}
       ]},
       {"title":"Muscles & Landmarks","lessons":[
         {"title":"The arm","difficulty":"intermediate","xp":20,"description":"Bicep, tricep, and the forearm's twisting muscles.","content":"Study and draw an arm in three rotations: palm up, palm down, and neutral, noting how the forearm muscles cross."},
         {"title":"The leg","difficulty":"intermediate","xp":20,"description":"The leg's muscle landmarks from hip to ankle.","content":"Draw a leg from three angles, marking the major muscle landmarks: quad, hamstring, calf."},
         {"title":"Hands (the hard part)","difficulty":"advanced","xp":30,"description":"Simplify the hand into a mitten shape plus a thumb before adding fingers.","content":"Draw the hand as a simple mitten shape with a separate thumb block first, then divide the mitten into four fingers."}
       ]}
     ]},
    {"slug":"color-theory","title":"Color Theory","icon":"Palette","description":"Hue, value, saturation, and how color creates mood.",
     "units":[
       {"title":"The Color Wheel","lessons":[
         {"title":"Primary, secondary, tertiary","difficulty":"beginner","xp":10,"description":"The building blocks of every color relationship.","content":"Paint or digitally fill a 12-step color wheel from the three primaries."},
         {"title":"Complementary colors","difficulty":"beginner","xp":15,"description":"Opposite colors create the most visual contrast.","content":"Create three small studies using only a complementary pair (e.g. red/green, blue/orange) plus black and white."},
         {"title":"Warm vs. cool light","difficulty":"intermediate","xp":20,"description":"Light and shadow are rarely the same temperature.","content":"Paint a simple sphere with warm light and cool shadow, then repeat with the temperatures reversed."}
       ]},
       {"title":"Color & Mood","lessons":[
         {"title":"Limited palettes","difficulty":"intermediate","xp":20,"description":"Constraint creates harmony.","content":"Paint a small scene using only three colors plus white — notice how much easier it is to keep the piece cohesive."},
         {"title":"Color for emotion","difficulty":"advanced","xp":25,"description":"The same scene reads differently depending on its palette.","content":"Paint the same simple scene twice: once in a warm, saturated palette and once in a cool, desaturated one. Compare the mood."}
       ]}
     ]},
    {"slug":"character-design","title":"Character Design","icon":"UserRound","description":"Silhouettes, shape language, and personality through design.",
     "units":[
       {"title":"Shape Language","lessons":[
         {"title":"Circles, squares, triangles","difficulty":"beginner","xp":10,"description":"Shape carries personality before a single detail is added.","content":"Design three character silhouettes, each built primarily from one shape family: round (friendly), square (sturdy), triangular (aggressive)."},
         {"title":"Silhouette readability","difficulty":"intermediate","xp":20,"description":"If the silhouette isn't readable, the design isn't finished.","content":"Fill your character silhouette solid black — if you can't tell what it's doing or holding, redesign the pose or props."}
       ]},
       {"title":"Personality & Costume","lessons":[
         {"title":"Designing for backstory","difficulty":"intermediate","xp":20,"description":"Every costume choice should answer a question about the character.","content":"Write three one-line facts about a character, then design a costume where each fact is visible in the silhouette or details."},
         {"title":"Color as identity","difficulty":"advanced","xp":25,"description":"A character's palette becomes their visual signature.","content":"Design a 3-color palette for your character and justify each color choice against their personality."}
       ]}
     ]},
    {"slug":"environment-art","title":"Environment Art","icon":"Mountain","description":"Composition, depth, and atmosphere for believable places.",
     "units":[
       {"title":"Composition Basics","lessons":[
         {"title":"Thumbnailing","difficulty":"beginner","xp":10,"description":"Small, fast sketches to solve composition before committing.","content":"Draw six thumbnail compositions (under 2 minutes each) for the same environment idea, varying horizon line and focal point."},
         {"title":"Rule of thirds & focal point","difficulty":"beginner","xp":15,"description":"Guide the eye deliberately through the scene.","content":"Redraw one of your thumbnails placing the focal point on a rule-of-thirds intersection."}
       ]},
       {"title":"Depth & Atmosphere","lessons":[
         {"title":"Atmospheric perspective","difficulty":"intermediate","xp":20,"description":"Distant objects lose contrast and saturation.","content":"Paint a simple layered landscape — foreground, midground, background — reducing contrast and saturation with each layer back."},
         {"title":"Foreground framing","difficulty":"intermediate","xp":20,"description":"Foreground elements add depth and scale.","content":"Add a foreground silhouette element (branch, rock, doorway) framing your landscape to exaggerate depth."}
       ]}
     ]},
    {"slug":"worldbuilding","title":"Worldbuilding","icon":"Globe","description":"Designing cultures, geography, and history that inform visual design.",
     "units":[
       {"title":"Foundations","lessons":[
         {"title":"Geography shapes culture","difficulty":"beginner","xp":10,"description":"Terrain and climate drive architecture, clothing, and lifestyle.","content":"Pick a terrain type (desert, tundra, jungle) and list five ways it would shape a culture's clothing and architecture."},
         {"title":"Designing a settlement","difficulty":"intermediate","xp":20,"description":"Where and why a settlement exists shapes its layout.","content":"Sketch a simple map of a settlement, deciding why it exists where it does (river crossing, defensible hill, trade route)."}
       ]},
       {"title":"Visual Culture","lessons":[
         {"title":"Iconography & symbols","difficulty":"intermediate","xp":20,"description":"Cultures communicate through recurring visual motifs.","content":"Design three symbols or icons representing values important to your fictional culture."},
         {"title":"Architecture from values","difficulty":"advanced","xp":25,"description":"What a culture values shows up in what it builds tall, wide, or hidden.","content":"Sketch a building whose form directly reflects one of your culture's core values (e.g. hierarchy, community, secrecy)."}
       ]}
     ]},
    {"slug":"pixel-art","title":"Pixel Art","icon":"Grid3x3","description":"Working within the grid — limited color and resolution as a craft.",
     "units":[
       {"title":"The Grid","lessons":[
         {"title":"Pixel-perfect lines","difficulty":"beginner","xp":10,"description":"Clean diagonal lines without stray pixels.","content":"Draw a clean diagonal line at 8px, 16px, and 32px canvas sizes, avoiding jagged single-pixel offsets."},
         {"title":"Limited palettes","difficulty":"beginner","xp":15,"description":"Pixel art rewards restraint — 4-8 colors is often enough.","content":"Create a 16x16 icon using only 4 colors, including one shade and one highlight."}
       ]},
       {"title":"Characters & Animation","lessons":[
         {"title":"A 16x16 character","difficulty":"intermediate","xp":20,"description":"Readable characters at tiny resolution rely on silhouette and color blocking.","content":"Design a simple 16x16 character sprite, prioritizing a readable silhouette over detail."},
         {"title":"Basic walk cycle","difficulty":"advanced","xp":30,"description":"Four frames is enough for a believable walk.","content":"Animate a 4-frame walk cycle for your character: contact, down, passing, up."}
       ]}
     ]},
    {"slug":"digital-painting","title":"Digital Painting","icon":"Brush","description":"Brushes, layers, and blending for painterly digital work.",
     "units":[
       {"title":"Brushes & Blending","lessons":[
         {"title":"Layer basics","difficulty":"beginner","xp":10,"description":"Sketch, block-in, and detail layers keep work flexible.","content":"Set up a 3-layer painting: a sketch layer, a color block-in layer beneath it at reduced opacity, and a detail layer on top."},
         {"title":"Soft vs. hard brushes","difficulty":"beginner","xp":15,"description":"Brush hardness controls how forms read.","content":"Paint the same simple form twice — once using only a hard round brush, once using only a soft airbrush. Compare readability."}
       ]},
       {"title":"Painterly Rendering","lessons":[
         {"title":"Blocking in light and shadow","difficulty":"intermediate","xp":20,"description":"Resist detailing until the big shapes read correctly.","content":"Block in a simple still life using only three values: light, mid, shadow — no blending, no detail yet."},
         {"title":"Edge control","difficulty":"advanced","xp":25,"description":"Not every edge should be equally sharp.","content":"Repaint your still life, softening secondary edges and keeping only the focal point's edges crisp."}
       ]}
     ]}
  ]$paths$;
begin
  for path_def in select * from jsonb_array_elements(paths)
  loop
    insert into public.learning_paths (slug, title, description, icon, order_index)
    values (
      path_def->>'slug',
      path_def->>'title',
      path_def->>'description',
      path_def->>'icon',
      (select count(*) from public.learning_paths)
    )
    returning id into v_path_id;

    for unit_def in select * from jsonb_array_elements(path_def->'units') with ordinality as u(value, idx)
    loop
      insert into public.units (path_id, title, order_index)
      values (v_path_id, unit_def->>'title', (select count(*) from public.units where path_id = v_path_id))
      returning id into v_unit_id;

      for lesson_def in select * from jsonb_array_elements(unit_def->'lessons')
      loop
        insert into public.lessons (unit_id, title, description, difficulty, xp_reward, content, order_index)
        values (
          v_unit_id,
          lesson_def->>'title',
          lesson_def->>'description',
          lesson_def->>'difficulty',
          (lesson_def->>'xp')::integer,
          lesson_def->>'content',
          (select count(*) from public.lessons where unit_id = v_unit_id)
        );
      end loop;
    end loop;
  end loop;
end $$;
