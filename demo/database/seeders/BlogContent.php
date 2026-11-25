<?php

namespace Database\Seeders;

/**
 * What the demo blog publishes: sections, the people who write, articles and
 * static pages. Everything here is fictional, written for the demo.
 */
final class BlogContent
{
    /** @return list<array{name: string, slug: string, color: string, description: string}> */
    public static function categories(): array
    {
        return [
            ['name' => 'News', 'slug' => 'news', 'color' => '#1f7a55', 'description' => 'What changed in the city this week, and why it matters.'],
            ['name' => 'Stories', 'slug' => 'stories', 'color' => '#b45309', 'description' => 'Long reads about the people who keep the city running.'],
            ['name' => 'Guides', 'slug' => 'guides', 'color' => '#1d4ed8', 'description' => 'Practical how-tos for walking, eating and getting around.'],
            ['name' => 'Culture', 'slug' => 'culture', 'color' => '#7e22ce', 'description' => 'Books, music, food and the places they happen.'],
        ];
    }

    /** @return array<string, string> tag => description */
    public static function tags(): array
    {
        return [
            'harbour' => 'The waterfront, its ferries and the people who work on it.',
            'transport' => 'Buses, ferries, trams and the timetables behind them.',
            'food' => 'Markets, kitchens and the people who cook for the city.',
            'walking' => 'Routes worth taking on foot.',
            'night' => 'The city after dark.',
            'history' => 'How the city came to be the way it is.',
            'newsroom' => 'How Fieldnotes works.',
            'books' => 'Libraries, bookshops and what we are reading.',
            'green' => 'Rooftops, parks and growing things.',
            'product' => 'What we ship for readers.',
        ];
    }

    /**
     * People with a public profile. Alice, Bob and Carol sign in to the demo; the
     * others are among the hundred seeded editors, by their email.
     *
     * @return array<string, array{slug: string, job_title: string, bio: string}> email => profile
     */
    public static function authors(): array
    {
        return [
            'alice@example.test' => ['slug' => 'alice-chen', 'job_title' => 'Editor-in-chief', 'bio' => 'Alice founded Fieldnotes after ten years on a daily paper. She edits every long read and still answers the reader inbox herself.'],
            'bob@example.test' => ['slug' => 'bob-martinez', 'job_title' => 'Features editor', 'bio' => 'Bob commissions the Stories section. He grew up above a print shop and believes every street has at least one good story.'],
            'carol@example.test' => ['slug' => 'carol-okafor', 'job_title' => 'Photo and design editor', 'bio' => 'Carol looks after how Fieldnotes looks, from covers to charts. She walks to work by a different route every day.'],
            'editor001@example.test' => ['slug' => 'ava-wong', 'job_title' => 'Harbour reporter', 'bio' => 'Ava covers the waterfront: ferries, shipyards and the people who work the night shift on the piers.'],
            'editor002@example.test' => ['slug' => 'noah-patel', 'job_title' => 'Transport correspondent', 'bio' => 'Noah rides every bus route he writes about, usually twice. He keeps a spreadsheet of timetable changes going back six years.'],
            'editor003@example.test' => ['slug' => 'mia-kim', 'job_title' => 'Food and culture writer', 'bio' => 'Mia writes about markets, small restaurants and the cooks behind them, and runs the Fieldnotes book club.'],
            'editor004@example.test' => ['slug' => 'leo-rossi', 'job_title' => 'Data reporter', 'bio' => 'Leo turns public records into stories, and maps into arguments. Ask him about bus stop spacing at your own risk.'],
        ];
    }

    /**
     * The first three are kept as the scenarios and screenshots expect them: Team
     * planning, A better way to collaborate, and Spring product update.
     *
     * @return list<array<string, mixed>>
     */
    public static function articles(): array
    {
        return [
            [
                'slug' => 'team-planning',
                'title' => 'Team planning',
                'category' => 'Guides',
                'status' => 'published',
                'author' => 'alice@example.test',
                'days_ago' => 6,
                'excerpt' => 'A practical guide to planning the next editorial release together, from the first pitch to the publishing slot.',
                'tags' => ['newsroom'],
                'body_html' => '<p>One plan, written by the whole desk. Every Monday at ten, the newsroom fills a single shared document with what it wants to publish in the next two weeks, and by eleven the plan is done.</p>'
                    .'<h2>Before the meeting</h2>'
                    .'<ul><li><p>Read last week’s notes, including what slipped and why.</p></li><li><p>Add the stories you want to pitch, with one line on why now.</p></li><li><p>Mark anything that depends on a photographer or a data request.</p></li></ul>'
                    .'<h2>In the meeting</h2>'
                    .'<p>We go through the plan top to bottom. Each pitch gets two minutes: what the story is, who it is for, and what it needs. The editor on duty decides there and then whether it goes into a slot, waits, or goes back for more reporting.</p>'
                    .'<blockquote><p>A plan is a promise to readers, not to ourselves. If a story is not ready, it moves.</p></blockquote>'
                    .'<h2>After the meeting</h2>'
                    .'<p>Every story in a slot gets an article in the CMS the same day, even if it only has a title. That way everyone can see what is being written, and by whom, and the plan stays in one place.</p>',
            ],
            [
                'slug' => 'better-collaboration',
                'title' => 'A better way to collaborate',
                'category' => 'Stories',
                'status' => 'draft',
                'author' => 'bob@example.test',
                'excerpt' => 'The people and habits behind a more connected newsroom.',
                'tags' => ['newsroom'],
                'body_html' => '<p>Great stories begin with a conversation. This piece follows three editors through a week of writing together, and asks what changed when they stopped emailing drafts to each other.</p>'
                    .'<p>Still to do: quotes from the subeditors, and a photo of the Monday meeting.</p>',
            ],
            [
                'slug' => 'spring-product-update',
                'title' => 'Spring product update',
                'category' => 'News',
                'status' => 'published',
                'author' => 'alice@example.test',
                'days_ago' => 2,
                'excerpt' => 'A first look at what the team has been building this season.',
                'tags' => ['product', 'newsroom'],
                'body_html' => '<h2>What is new this season</h2>'
                    .'<p>We rebuilt the reading experience from the first paragraph to the last, so long articles are calmer and quicker to load.</p>'
                    .'<p>Editors can now work on the same article at the same time, and see each other while they do it.</p>'
                    .'<h3>Coming next</h3>'
                    .'<ul><li><p>Reading lists for subscribers</p></li><li><p>Audio versions of long reads</p></li></ul>'
                    .'<p>Welcome to the public Fieldnotes blog.</p>',
                'key_points' => [
                    ['point' => 'Faster reading on long articles', 'highlight' => true],
                    ['point' => 'Editors work on one article together', 'highlight' => false],
                ],
                'seo_title' => 'Spring product update | Fieldnotes',
                'seo_description' => 'What shipped this season at Fieldnotes.',
                'seo_keywords' => 'product update, spring',
            ],
            [
                'slug' => 'inside-the-harbour-repair-sheds',
                'title' => 'Inside the harbour repair sheds',
                'category' => 'Stories',
                'status' => 'published',
                'author' => 'editor001@example.test',
                'days_ago' => 0,
                'excerpt' => 'Every ferry in the city passes through three sheds on the western waterfront. We spent a night shift with the people who keep them afloat.',
                'tags' => ['harbour', 'night', 'transport'],
                'body_html' => '<p>At eleven at night, when the last ferry ties up, the western sheds wake up. Floodlights come on, a crane swings out over the water, and the first hull of the night is winched up the slipway, dripping.</p>'
                    .'<p>Mr Lau has worked here for thirty-one years. He can tell what is wrong with an engine by the sound it makes on the way in. “The young ones use laptops,” he says. “I use my ears. We usually agree.”</p>'
                    .'<h2>Six hours, every night</h2>'
                    .'<p>The crew has until five in the morning. Anything they cannot fix by then becomes tomorrow’s cancelled sailing, and they take that personally. On the night we visited, they replaced a propeller shaft, patched two hulls and repainted a set of steps that had been worn smooth by forty years of commuters.</p>'
                    .'<blockquote><p>Nobody thanks you for a ferry that leaves on time. That is how you know you did it right.</p></blockquote>'
                    .'<h2>What comes next</h2>'
                    .'<p>The sheds are due to move to a new site across the bay in three years. The crew are cautiously positive: the new slipways are wider, and the canteen will have windows. Mr Lau plans to retire the week before the move. “Somebody else can learn where the new noises come from,” he says.</p>',
            ],
            [
                'slug' => 'why-the-ferry-timetable-changed',
                'title' => 'Why the ferry timetable changed',
                'category' => 'News',
                'status' => 'published',
                'author' => 'editor002@example.test',
                'days_ago' => 1,
                'excerpt' => 'Fewer sailings at noon, more at seven. The operator explains the new timetable, and we checked their numbers.',
                'tags' => ['harbour', 'transport'],
                'body_html' => '<p>From next Monday, the cross-harbour ferry will run every eight minutes at the morning peak instead of every twelve, and every twenty minutes in the middle of the day instead of every fifteen.</p>'
                    .'<h2>What the operator says</h2>'
                    .'<p>The operator says ticket data shows the midday boats running a third full, while the seven o’clock sailings leave people on the pier. Moving two boats from noon to the morning, it argues, carries more people with the same fuel.</p>'
                    .'<h2>What the numbers show</h2>'
                    .'<p>We asked for the passenger counts behind the change and got them. They broadly back the operator up: the busiest morning sailing carried 412 people in a boat licensed for 400 on four days out of five last month.</p>'
                    .'<ul><li><p>Morning peak: every 8 minutes, from 6:50 to 9:30.</p></li><li><p>Midday: every 20 minutes, from 10:00 to 16:00.</p></li><li><p>Evenings and weekends are unchanged.</p></li></ul>'
                    .'<p>Readers who rely on the midday boat, many of them older passengers going to the clinic across the water, have told us the longer wait is hard in summer. The operator says it will add shaded seating on both piers by July.</p>',
            ],
            [
                'slug' => 'small-farms-on-rooftop-kowloon',
                'title' => 'Small farms on rooftop Kowloon',
                'category' => 'News',
                'status' => 'published',
                'author' => 'editor003@example.test',
                'days_ago' => 3,
                'excerpt' => 'More than forty rooftops now grow vegetables for the restaurants below them. A new grant wants to double that.',
                'tags' => ['green', 'food'],
                'body_html' => '<p>Twelve floors above one of the busiest streets in the city, Grace Yip is picking choi sum. In an hour, it will be on plates in the noodle shop downstairs.</p>'
                    .'<p>Her rooftop is one of more than forty that now supply restaurants in the same building or the one next door. Most began as hobbies. Some now cover a quarter of a kitchen’s greens.</p>'
                    .'<h2>A grant for the next forty</h2>'
                    .'<p>The district council has opened a grant for building owners who want to start a rooftop farm: up to the cost of raised beds, irrigation and a safety survey. Applications close at the end of the month.</p>'
                    .'<p>The hardest part, growers say, is not soil or water but stairs. “Everything goes up by hand,” says Yip. “Compost, seedlings, the watering can. You stay fit.”</p>',
            ],
            [
                'slug' => 'how-we-choose-what-to-cover',
                'title' => 'How we choose what to cover',
                'category' => 'Guides',
                'status' => 'published',
                'author' => 'alice@example.test',
                'days_ago' => 5,
                'excerpt' => 'Three questions we ask before we commission a story, and the stories we turn down.',
                'tags' => ['newsroom'],
                'body_html' => '<p>We publish about six stories a week. We are pitched about sixty. This is how we decide.</p>'
                    .'<h2>Is it about the city, from the ground?</h2>'
                    .'<p>We write about places you can walk to and people you could meet. If a story could have been written from a desk anywhere, it is probably not for us.</p>'
                    .'<h2>Will a reader do something differently?</h2>'
                    .'<p>Take a different route, try a different market, ask a question at the next council meeting. A story does not need a call to action, but it should leave the reader knowing something useful.</p>'
                    .'<h2>Can we do it properly?</h2>'
                    .'<p>Some stories need a month of reporting and a lawyer. We would rather write one of those well than five quick ones badly, so we say no to things we do not have time to do right.</p>'
                    .'<p>If you have a story for us, the Contact page explains how to reach the desk.</p>',
            ],
            [
                'slug' => 'a-field-guide-to-slower-mornings',
                'title' => 'A field guide to slower mornings',
                'category' => 'Guides',
                'status' => 'published',
                'author' => 'carol@example.test',
                'days_ago' => 8,
                'excerpt' => 'Five places to start the day before the city does: a tea house, a park, a pier and two benches with a view.',
                'tags' => ['walking'],
                'body_html' => '<p>The city is loud by nine. Before seven, it belongs to tai chi groups, delivery drivers and people walking dogs who are much too awake. These are our favourite places to join them.</p>'
                    .'<h2>The tea house that opens at six</h2>'
                    .'<p>The first trays of dim sum come out at ten past six, and the regulars have their own tables. Sit at the counter, order the char siu bao, and do not ask for the newspaper: it belongs to the man in the corner.</p>'
                    .'<h2>The park above the tunnel</h2>'
                    .'<p>A long lawn on top of the road tunnel, with the best sunrise on this side of the harbour. Bring a coffee from the kiosk on the corner; it opens at half past six.</p>'
                    .'<h2>The pier at the end of the line</h2>'
                    .'<p>Take the first tram to the terminus and walk five minutes to the old pier. Fishermen arrive at half past six. They do not mind company, as long as it is quiet.</p>'
                    .'<p>Carol walks one of these every week. She says the trick is to leave your phone in your pocket until you are on the way home.</p>',
            ],
            [
                'slug' => 'what-the-night-bus-drivers-know',
                'title' => 'What the night bus drivers know',
                'category' => 'Stories',
                'status' => 'published',
                'author' => 'editor002@example.test',
                'days_ago' => 10,
                'excerpt' => 'Between one and five in the morning, eleven routes keep the city moving. Their drivers see a side of it the rest of us sleep through.',
                'tags' => ['night', 'transport'],
                'body_html' => '<p>The N11 leaves the airport at ten past one. By the time it reaches the harbour, it is carrying cleaners, cooks, nurses and a man with a cello. Driver Kwok Wai has driven it for nine years.</p>'
                    .'<p>“Daytime passengers are in a hurry,” he says. “Night passengers are tired. They want to get home, and they want a driver who will wait ten seconds while they run for the stop.” He always waits.</p>'
                    .'<h2>A route map of the night economy</h2>'
                    .'<p>Leo Rossi, our data reporter, mapped where night bus passengers get on and off. The busiest stops are not near bars or clubs but near hospitals, markets and the container port: the jobs that keep running while the rest of the city sleeps.</p>'
                    .'<blockquote><p>You learn who the city really depends on when you drive it at three in the morning.</p></blockquote>'
                    .'<p>The transport department is reviewing night routes this year. Drivers we spoke to hope it starts by asking the people on board.</p>',
            ],
            [
                'slug' => 'the-libraries-that-stay-open-late',
                'title' => 'The libraries that stay open late',
                'category' => 'Culture',
                'status' => 'published',
                'author' => 'editor003@example.test',
                'days_ago' => 12,
                'excerpt' => 'Four public libraries now open until ten at night. We spent an evening in each to see who uses them.',
                'tags' => ['books', 'night'],
                'body_html' => '<p>At half past nine on a Tuesday, the reading room on the fourth floor is nearly full. Students with highlighters, a man reading the racing pages, two women doing a jigsaw puzzle in silence.</p>'
                    .'<p>The late opening began as a six-month trial last year. It was meant to help students in small flats find somewhere quiet to study. It has, but it has also become something else: a warm, free, well-lit place to be in the evening, for anyone.</p>'
                    .'<h2>Who comes after eight</h2>'
                    .'<ul><li><p>Students, mostly, in the weeks before exams.</p></li><li><p>Shift workers on a break between jobs.</p></li><li><p>Older readers who say the daytime is too busy.</p></li></ul>'
                    .'<p>The librarians on the late shift say it is their favourite one. “It is calmer,” says one. “People come because they want to be here.”</p>',
            ],
            [
                'slug' => 'the-last-typewriter-shop',
                'title' => 'The last typewriter shop',
                'category' => 'Culture',
                'status' => 'published',
                'author' => 'bob@example.test',
                'days_ago' => 15,
                'excerpt' => 'Mr Ho has repaired typewriters on the same street for fifty-two years. His customers now are mostly under thirty.',
                'tags' => ['history'],
                'body_html' => '<p>The shop is two metres wide and smells of oil and old paper. Typewriters are stacked to the ceiling, each with a cardboard tag tied to the carriage return: a name, a phone number, and what is wrong.</p>'
                    .'<p>Ho Kin-wah opened it in 1974. For decades his customers were offices and government departments. Then computers came, and for a long time almost nobody did. Now, he says, the young ones are back.</p>'
                    .'<blockquote><p>They say it helps them think. I say it helps them make mistakes they cannot delete. Maybe that is the same thing.</p></blockquote>'
                    .'<p>He has no plans to close, and no apprentice. When we asked who will fix the city’s typewriters after him, he handed us a small screwdriver and told us to come back on Saturday.</p>',
            ],
            [
                'slug' => 'a-beginners-guide-to-oral-history',
                'title' => 'A beginner’s guide to oral history',
                'category' => 'Guides',
                'status' => 'published',
                'author' => 'editor004@example.test',
                'days_ago' => 18,
                'excerpt' => 'How to record a grandparent, a neighbour or a shopkeeper telling their story, and what to do with the recording afterwards.',
                'tags' => ['history'],
                'body_html' => '<p>Everyone knows someone whose memories are worth keeping. Recording them takes an hour and a phone. Doing it well takes a little preparation.</p>'
                    .'<h2>Before you press record</h2>'
                    .'<ul><li><p>Ask permission, and explain what the recording is for.</p></li><li><p>Find a quiet room with soft furnishings: curtains and cushions absorb echo.</p></li><li><p>Write five open questions, then be ready to abandon them.</p></li></ul>'
                    .'<h2>During the interview</h2>'
                    .'<p>Start with something easy: where they grew up, what their street looked like. Let silences run; people often say the most interesting thing after a pause. Do not interrupt to correct a date.</p>'
                    .'<h2>Afterwards</h2>'
                    .'<p>Save two copies, write down who, where and when, and ask whether they would like to share it with the city archive, which now accepts recordings from the public.</p>',
            ],
            [
                'slug' => 'twelve-hours-at-the-wet-market',
                'title' => 'Twelve hours at the wet market',
                'category' => 'Culture',
                'status' => 'published',
                'author' => 'editor003@example.test',
                'days_ago' => 21,
                'excerpt' => 'From the first fish delivery at four to the last discount at four in the afternoon, a day with the stallholders of one market hall.',
                'tags' => ['food'],
                'body_html' => '<p>The fish arrive at four, packed in ice on the back of a lorry that has driven from the fishing port in the dark. By five, the stalls are set out, and the first customers, mostly restaurant cooks, are already arguing about prices.</p>'
                    .'<h2>Morning: the regulars</h2>'
                    .'<p>Between seven and ten, the market belongs to people who have shopped here for decades. They know which stall has the best tofu, and which vegetable seller will slip in a handful of spring onions for free.</p>'
                    .'<h2>Afternoon: the bargains</h2>'
                    .'<p>After two, prices fall. Students and young families arrive with the timing of people who have done the maths. By four, the floor is hosed down and the hall is empty again.</p>'
                    .'<p>The market is due for renovation next year. Stallholders want air conditioning and better drains; most of all, they want to be allowed to come back.</p>',
            ],
            [
                'slug' => 'mapping-every-bench-on-the-waterfront',
                'title' => 'We mapped every bench on the waterfront',
                'category' => 'News',
                'status' => 'published',
                'author' => 'editor004@example.test',
                'days_ago' => 25,
                'excerpt' => 'There are 1,184 public benches between the two bridges. Almost a third face away from the water.',
                'tags' => ['harbour', 'walking'],
                'body_html' => '<p>Over three weekends, four volunteers and one data reporter walked the eleven kilometres of waterfront promenade and logged every public bench: where it is, which way it faces, and whether it has shade.</p>'
                    .'<h2>What we found</h2>'
                    .'<ul><li><p>1,184 benches, or one every nine metres on average.</p></li><li><p>371 face away from the water, towards a road or a wall.</p></li><li><p>Only 214 have any shade at noon in summer.</p></li></ul>'
                    .'<p>The longest stretch without a bench is 640 metres, past the old cargo piers. It is also one of the most popular running routes.</p>'
                    .'<p>The map, and the data behind it, is free to use. The harbourfront commission has asked for a copy.</p>',
            ],
            [
                'slug' => 'planning-a-city-walk-with-no-map',
                'title' => 'Planning a city walk with no map',
                'category' => 'Guides',
                'status' => 'review',
                'author' => 'carol@example.test',
                'excerpt' => 'Follow the trams, the smell of bread, or the oldest building you can see. A guide to getting pleasantly lost.',
                'tags' => ['walking'],
                'body_html' => '<p>The best walks are the ones you did not plan. This guide suggests five simple rules for finding your way without a map, and getting home again.</p>'
                    .'<p>Draft: Carol to add photos of the three test walks.</p>',
            ],
            [
                'slug' => 'our-newsroom-style-guide-revised',
                'title' => 'Our newsroom style guide, revised',
                'category' => 'Guides',
                'status' => 'review',
                'author' => 'alice@example.test',
                'excerpt' => 'Plain words, short sentences, and why we stopped writing “iconic”.',
                'tags' => ['newsroom'],
                'body_html' => '<p>Our style guide is two pages long. This year we changed six things, most of them about words we use too often.</p>'
                    .'<p>For review: Bob, please check the section on headlines.</p>',
            ],
            [
                'slug' => 'notes-from-a-week-without-email',
                'title' => 'Notes from a week without email',
                'category' => 'Stories',
                'status' => 'draft',
                'author' => 'bob@example.test',
                'excerpt' => 'The newsroom tried a week of writing everything in shared drafts instead. Here is what broke, and what stuck.',
                'tags' => ['newsroom'],
                'body_html' => '<p>On Monday we switched off the newsroom mailing list. By Wednesday, nobody missed it.</p>'
                    .'<p>Notes so far: the shared drafts worked; the shared calendar did not.</p>',
            ],
            [
                'slug' => 'where-to-hear-live-music-on-a-weeknight',
                'title' => 'Where to hear live music on a weeknight',
                'category' => 'Culture',
                'status' => 'draft',
                'author' => 'editor003@example.test',
                'excerpt' => 'Jazz in a basement, folk in a bookshop and a choir that rehearses in a car park.',
                'tags' => ['night'],
                'body_html' => '<p>Five places with music on a Tuesday, all free or nearly free.</p>'
                    .'<p>Still to visit: the car park choir on Thursday.</p>',
            ],
        ];
    }

    /** @return array<string, list<string>> slug => slugs of related articles */
    public static function related(): array
    {
        return [
            'spring-product-update' => ['team-planning', 'how-we-choose-what-to-cover'],
            'inside-the-harbour-repair-sheds' => ['why-the-ferry-timetable-changed', 'what-the-night-bus-drivers-know', 'mapping-every-bench-on-the-waterfront'],
            'what-the-night-bus-drivers-know' => ['inside-the-harbour-repair-sheds', 'the-libraries-that-stay-open-late'],
        ];
    }

    /**
     * Static pages, in English and Chinese. About and Contact come first: the
     * scenarios open pages 1 and 2.
     *
     * @return list<array{slug: string, title: array<string, string>, summary: array<string, string>, body: array<string, string>}>
     */
    public static function pages(): array
    {
        return [
            [
                'slug' => 'about',
                'title' => ['en' => 'About Fieldnotes', 'zh_HK' => '關於 Fieldnotes'],
                'summary' => ['en' => 'Who we are and what we write about.', 'zh_HK' => '我們是誰，寫些甚麼。'],
                'body' => [
                    'en' => '<p>Fieldnotes is a small, independent city magazine. We write slow, careful stories about how the city works, the people who keep it running, and the quieter places worth finding.</p>'
                        .'<h2>How we work</h2>'
                        .'<p>Every story is reported on foot. We visit, we listen, and we check what we are told. We publish about six stories a week, and we would rather be right than first.</p>'
                        .'<h2>Who we are</h2>'
                        .'<p>Seven writers and editors, a hundred contributors, and a lot of comfortable shoes. Our editors write and edit together in one shared CMS, so a story can be improved by several people at once.</p>'
                        .'<p>Fieldnotes is a demo: the articles and people on this site are fictional.</p>',
                    'zh_HK' => '<p>Fieldnotes 是一本小型的獨立城市雜誌。我們慢慢地、仔細地寫這座城市怎樣運作、誰令它運作，以及值得尋找的安靜角落。</p>'
                        .'<p>這是一個示範網站：文章和人物都是虛構的。</p>',
                ],
            ],
            [
                'slug' => 'contact',
                'title' => ['en' => 'Contact us', 'zh_HK' => '聯絡我們'],
                'summary' => ['en' => 'Write to the newsroom.', 'zh_HK' => '寫信給編輯部。'],
                'body' => [
                    'en' => '<p>We read every message, and we reply to most of them.</p>'
                        .'<h2>Story ideas</h2>'
                        .'<p>Tell us what you have seen, where, and why it matters to you. A few lines are enough; we will ask for more if we need it.</p>'
                        .'<h2>Corrections</h2>'
                        .'<p>If we got something wrong, we want to know. Tell us which article, what is wrong, and how you know. We publish corrections at the end of the article.</p>'
                        .'<h2>The newsroom</h2>'
                        .'<p>Fieldnotes, 3rd floor, 18 Harbour Lane. We are in the office from ten to six on weekdays.</p>'
                        .'<p>This is a demo: the address is fictional, and messages are not sent anywhere.</p>',
                    'zh_HK' => '<p>我們會細閱每一封來信。</p><p>這是一個示範網站：地址是虛構的。</p>',
                ],
            ],
            [
                'slug' => 'privacy',
                'title' => ['en' => 'Privacy', 'zh_HK' => '私隱政策'],
                'summary' => ['en' => 'What we collect, and what we do not.', 'zh_HK' => '我們收集甚麼，不收集甚麼。'],
                'body' => [
                    'en' => '<p>Fieldnotes does not use advertising trackers or third-party analytics.</p>'
                        .'<h2>What we keep</h2>'
                        .'<ul><li><p>Server logs, for fourteen days, to keep the site running.</p></li><li><p>Your email address, if you subscribe to the Sunday dispatch, until you unsubscribe.</p></li></ul>'
                        .'<h2>What we never do</h2>'
                        .'<p>We do not sell or share your details, and we do not build profiles of readers.</p>'
                        .'<p>This page is part of a demo and describes no real service.</p>',
                    'zh_HK' => '<p>Fieldnotes 不使用廣告追蹤或第三方分析工具。</p>',
                ],
            ],
            [
                'slug' => 'terms',
                'title' => ['en' => 'Terms of use', 'zh_HK' => '使用條款'],
                'summary' => ['en' => 'The small print, kept small.', 'zh_HK' => '細則，盡量簡短。'],
                'body' => [
                    'en' => '<p>You are welcome to read, share and link to anything on Fieldnotes.</p>'
                        .'<h2>Quoting our work</h2>'
                        .'<p>Quote a paragraph or two with a link back to the article. For anything longer, or for photos and maps, please ask first.</p>'
                        .'<h2>Comments and corrections</h2>'
                        .'<p>We may edit or decline letters for length and clarity, and we will always say when an article has been corrected.</p>'
                        .'<p>This page is part of a demo and describes no real service.</p>',
                    'zh_HK' => '<p>歡迎閱讀、分享及連結 Fieldnotes 的任何內容。</p>',
                ],
            ],
        ];
    }
}
