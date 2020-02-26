Friday 2/21 updates:
- No updates, school vacation week.

Friday 2/14 updates:
- **Maintenance**: Update eslintrc to restore no-console [#2760](https://github.com/studentinsights/studentinsights/pull/2760)
- **Maintenance**: Fail build when mismatch between Gemfile and Gemfile.lock [#2764](https://github.com/studentinsights/studentinsights/pull/2764) [#2766](https://github.com/studentinsights/studentinsights/pull/2766)
- **Security**: Update nokogiri info
- **New Bedford**: Security updates
- **STAR**: Update for New Bedford
- **Reading**: Add cohort chart and raw scores [#2761](https://github.com/studentinsights/studentinsights/pull/2761)
- **Reading**: Limit reader profile by grade [#2765](https://github.com/studentinsights/studentinsights/pull/2765)
- **Reading**: Fix images of Phoneme Segmentation Fluency materials [#2767](https://github.com/studentinsights/studentinsights/pull/2767)

Friday 2/7 updates:
- **Maintenance**: Upgrades to Storybook, fetch-mock, fetch-mock-jest, config for auditjs [#2758](https://github.com/studentinsights/studentinsights/pull/2758)
- **Maintenance**: JS dependency updates [#2759](https://github.com/studentinsights/studentinsights/pull/2759)
- **Maintenance**: Upgrade node.js

Friday 1/31 updates:
- **Reading**: Improve layout, add materials, minimal ACCESS, and rework story/test data [#2753](https://github.com/studentinsights/studentinsights/pull/2753)
- **Reading**: Show all data points when expanded [#2754](https://github.com/studentinsights/studentinsights/pull/2754)
- **Reading**: Add BoxChart visual [#2755](https://github.com/studentinsights/studentinsights/pull/2755)
- **Reading**: Add coloring to history view, for validating data [#2756](https://github.com/studentinsights/studentinsights/pull/2756)
- **Reading**: Add rest of DIBELS materials, allow paging, add thresholds link [#2757](https://github.com/studentinsights/studentinsights/pull/2757)

Friday 1/24 updates:
- **Import**: Check freshness when downloading file [#2747](https://github.com/studentinsights/studentinsights/pull/2747) [#2751](https://github.com/studentinsights/studentinsights/pull/2751)
- **Reading**: January reader profile prototype [#2748](https://github.com/studentinsights/studentinsights/pull/2748) [#2750](https://github.com/studentinsights/studentinsights/pull/2750) [#2752](https://github.com/studentinsights/studentinsights/pull/2752)
- **Security**: Update secure headers 32d284

Friday 1/17 updates:
- **Maintenance**: Update concurrently package [#2743](https://github.com/studentinsights/studentinsights/pull/2743)
- **STAR**: Update config for importers to allow disabling importers [#2742](https://github.com/studentinsights/studentinsights/pull/2742)
- **Monitoring**: Update Rollbar safelist to allow sync alerts to send more info [#2744](https://github.com/studentinsights/studentinsights/pull/2744)
- **Reading**: Update importer to better tolerate unmatched student ids [#2741](https://github.com/studentinsights/studentinsights/pull/2741)
- **Educators importer**: Track missing email or login_name separately and skip [#2745](https://github.com/studentinsights/studentinsights/pull/2745)
- **Educators importer**: Skip trying to match homerooms when none set [#2746](https://github.com/studentinsights/studentinsights/pull/2746)
- **Security**: Update npm

Friday 1/10 updates:
- **Levels**: Also export reversed name in download [#2736](https://github.com/studentinsights/studentinsights/pull/2736])
- **Export**: Swap in CSV package for escaping [#2737](https://github.com/studentinsights/studentinsights/pull/2737])
- **Reading**: Design iterations on reader profile mockups (see internal docs)

Friday 1/3 updates:
- **Security**: Update JavaScript dependency resolutions [#2735](https://github.com/studentinsights/studentinsights/pull/2735)

Friday 12/13 updates:
- **Google API**: Retry by default [#2725](https://github.com/studentinsights/studentinsights/pull/2725)
- **Testing**: Update CoverageChecker to notice when file names change [#2726](https://github.com/studentinsights/studentinsights/pull/2726)
- **Login security**: Enable email verification on login, for internal use only [#2721](https://github.com/studentinsights/studentinsights/pull/2721)
- **Login**: Adjust drift_behind for MFA verification [#2728](https://github.com/studentinsights/studentinsights/pull/2728)

Friday 12/6 updates:
- **Notes**: Fix to resizing text area when longer than screen height [#2719](https://github.com/studentinsights/studentinsights/pull/2719) [#2720](https://github.com/studentinsights/studentinsights/pull/2720)
- **Demo**: Support language dropdown for Levels page in demo [#2718](https://github.com/studentinsights/studentinsights/pull/2718)
- **Maintenance**: Object.values polyfill for IE11 [#2717](https://github.com/studentinsights/studentinsights/pull/2717)
- **Maintenance**: Upgrade to Rails 6 [#2679](https://github.com/studentinsights/studentinsights/pull/2679)
- **Monitoring**: Review and safelist some fields for alerting [#2724](https://github.com/studentinsights/studentinsights/pull/2724)
- **Security**: Update Puma server to 4.3.1
- **Admin tools**: Fix breaking changes in administrate; remove some code on top [#2722](https://github.com/studentinsights/studentinsights/pull/2722)
- **Admin tools**: Fix bug blocking districtwide users not set as admin in SIS from seeing import jobs [#2723](https://github.com/studentinsights/studentinsights/pull/2723)

Friday 11/29 updates:
- **Problem solving**: Trying variant of problem solving for reading in MTSS

Friday 11/22 updates:
- **MCAS**: Update score range, add more tests [#2713](https://github.com/studentinsights/studentinsights/pull/2713) [#2714](https://github.com/studentinsights/studentinsights/pull/2714) [#2715](https://github.com/studentinsights/studentinsights/pull/2715)
- **Security**: Another scrub pass on importer logging [#2710](https://github.com/studentinsights/studentinsights/pull/2710)
- **Security**: Update scrubbing in Rollbar.js for searching notes
- **Search notes**: Release for Bedford school and instructional leaders








Friday 11/15 updates:
- **STAR**: Update config to read from export SFTP box instead of vendor [#2712](https://github.com/studentinsights/studentinsights/pull/2712)


Friday 11/8 updates:
- **Accounts**: Re-run imports after debugging upstream issues in New Bedford SIS export
- **Import**: Close SFTP session more aggressively [#2699](https://github.com/studentinsights/studentinsights/pull/2699)
- **Monitoring**: Update Rollbar Ruby gem and tighten configuration [#2693](https://github.com/studentinsights/studentinsights/pull/2693) [#2711](https://github.com/studentinsights/studentinsights/pull/2711)
- **Monitoring**: Upgrade Rollbar.js version [#2695](https://github.com/studentinsights/studentinsights/pull/2695) [#2696](https://github.com/studentinsights/studentinsights/pull/2696) [#2698](https://github.com/studentinsights/studentinsights/pull/2698)
- **Maintenance**: Create DistrictConfigLog to enable more self-serve district maintenance [#2701](https://github.com/studentinsights/studentinsights/pull/2701)
- **Security**: Update Rack:Attack to alert separately for targeted URLs [#2691](https://github.com/studentinsights/studentinsights/pull/2691) [#2697](https://github.com/studentinsights/studentinsights/pull/2697)
- **Security**: Investigate URL leaks in New Bedford
- **Security**: Update secure_headers gem [#2694](https://github.com/studentinsights/studentinsights/pull/2694)
- **Security**: Update gitignore to be more defensive about files [#2700](https://github.com/studentinsights/studentinsights/pull/2700)
- **Security**: Remove bcc from LoginChecker [#2704](https://github.com/studentinsights/studentinsights/pull/2704)
- **Security**: auditjs added to Travis build [#2702](https://github.com/studentinsights/studentinsights/pull/2702)
- **Security**: Add rails_best_practices checks to Travis build, do cleanup [#2703](https://github.com/studentinsights/studentinsights/pull/2703)
- **Security**: Another scrub pass on importer logging [#2710](https://github.com/studentinsights/studentinsights/pull/2710)
- **Security**: Remove use of innerHTML, disallow with linter [#2706](https://github.com/studentinsights/studentinsights/pull/2706)
- **STAR**: Abort importers if filenames aren't set in config [#2705](https://github.com/studentinsights/studentinsights/pull/2705)
- **Services**: Move filtering of provider suggestions to client, narrow scope of list [#2708](https://github.com/studentinsights/studentinsights/pull/2708) [#2709](https://github.com/studentinsights/studentinsights/pull/2709)


Friday 11/1 updates:
- **PD workshop**: Talking and writing about students with Strengths-based mindsets, [workshop #2 slides](https://docs.google.com/presentation/d/1J0vNnHMX2JYS_NbZ9Ck-Vr329O-RuCaC3tYWUC_3p7w)
- **Reflection**: Patterns within notes [#2683](https://github.com/studentinsights/studentinsights/pull/2683) [#2684](https://github.com/studentinsights/studentinsights/pull/2684) [#2686](https://github.com/studentinsights/studentinsights/pull/2686)
- **STAR**: Update after breaking changes to vendor export [#2681](https://github.com/studentinsights/studentinsights/pull/2681) [#2682](https://github.com/studentinsights/studentinsights/pull/2682) [#2688](https://github.com/studentinsights/studentinsights/pull/2688) [#2692](https://github.com/studentinsights/studentinsights/pull/2692)
- **Services**: Updating Somerville service type descriptions [#2687](https://github.com/studentinsights/studentinsights/pull/2687)
- **Maintenance**: Bump brakeman [#2689](https://github.com/studentinsights/studentinsights/pull/2689)


Friday 10/25 updates:
- **School scope**: Add Pulaski for New Bedford [#2674](https://github.com/studentinsights/studentinsights/pull/2674)
- **Maintenance**: Upgrade to node 12 [#2675](https://github.com/studentinsights/studentinsights/pull/2675)
- **Maintenance**: Remove transitional flags to complete upgrade to Rails 5.2 [#2676](https://github.com/studentinsights/studentinsights/pull/2676)
- **Sports teams**: Automate import, revise template, always include in educator contacts [#2677](https://github.com/studentinsights/studentinsights/pull/2677)
- **Sports teams**: Tighten validations, add to main import task, update icons [#2678](https://github.com/studentinsights/studentinsights/pull/2678)
- **Services**: UI for new elements describing services, update available choices and non-academic phaselines [#2542](https://github.com/studentinsights/studentinsights/pull/2542)
- **Service info**: Update to set per-district as well as with label [#2680](https://github.com/studentinsights/studentinsights/pull/2680)


Friday 10/18 updates:
- **PD workshop**: Talking and writing about students with Strengths-based mindsets, [workshop #1 slides](https://docs.google.com/presentation/d/1J0vNnHMX2JYS_NbZ9Ck-Vr329O-RuCaC3tYWUC_3p7w)
- **Student meeting importer**: Automate import process [#2671](https://github.com/studentinsights/studentinsights/pull/2671)
- **Notes**: Add New Bedford SST for taking notes, in table columns, and search [#2672](https://github.com/studentinsights/studentinsights/pull/2672)
- **School roster**: Add minimal download CSV button [#2673](https://github.com/studentinsights/studentinsights/pull/2673)


Friday 10/11 updates:
- **New Bedford sections**: Update paths for new exports [#2668](https://github.com/studentinsights/studentinsights/pull/2668)
- **Sections**: Add dialog link for New Bedford, preserving tabs [#2670](https://github.com/studentinsights/studentinsights/pull/2670)


Friday 10/4 updates:
- **Authorization**: Remove authorization for sections from Educator, and other unused methods [#2647](https://github.com/studentinsights/studentinsights/pull/2647)
- **Authorization**: Centralize section authorization in Authorizer [#2654](https://github.com/studentinsights/studentinsights/pull/2654)
- **Authorization**: Add separate flag for section-based authorization [#2661](https://github.com/studentinsights/studentinsights/pull/2661)
- **Section authorization**: Optimize method to make it faster [#2656](https://github.com/studentinsights/studentinsights/pull/2656)
- **Course and Section imports**: Update to use Syncer and revise stats [#2659](https://github.com/studentinsights/studentinsights/pull/2659)
- **Courses**: Add uniqueness index [#2660](https://github.com/studentinsights/studentinsights/pull/2660)
- **Grades importer**: Update logging to be more verbose [#2663](https://github.com/studentinsights/studentinsights/pull/2663)
- **Home feed**: Optimize query for event notes [#2651](https://github.com/studentinsights/studentinsights/pull/2651)
- **Home feed**: Add index to optimize imported form queries [#2650](https://github.com/studentinsights/studentinsights/pull/2650)
- **Home page**: Optimize query for authorized students [#2652](https://github.com/studentinsights/studentinsights/pull/2652)
- **Tardies**: Import Tardy records for CSV rows with both absence and tardy bits set [#1925](https://github.com/studentinsights/studentinsights/pull/1925) [#2658](https://github.com/studentinsights/studentinsights/pull/2658)
- **Maintenance**:  Upgrade Ruby version [#2649](https://github.com/studentinsights/studentinsights/pull/2649) [#2655](https://github.com/studentinsights/studentinsights/pull/2655)
- **Maintenance**: Remove get_process_mem [#2662](https://github.com/studentinsights/studentinsights/pull/2662)
- **Maintenance**: Tune Rollbar throttling to be stricter [#2665](https://github.com/studentinsights/studentinsights/pull/2665)
- **Reading**: Design iterations on Someville 2019-2020 reading debug (9/24/19)
- **Reading**: Design iterations on Reader Profile (10/4/19)


Friday 9/27 updates:
- **Reading**: Updates to importer [#2619](https://github.com/studentinsights/studentinsights/pull/2619) [#2620](https://github.com/studentinsights/studentinsights/pull/2620) [#2621](https://github.com/studentinsights/studentinsights/pull/2621)
- **Reading**: Minimal page for debugging import process by homeroom [#2622](https://github.com/studentinsights/studentinsights/pull/2622) [#2627](https://github.com/studentinsights/studentinsights/pull/2627) [#2632](https://github.com/studentinsights/studentinsights/pull/2632)
- **Reading**: Update GoogleSheetsFetcher to recur into folders and batch calls [#2623](https://github.com/studentinsights/studentinsights/pull/2623) [#2626](https://github.com/studentinsights/studentinsights/pull/2626)
- **Reading**: Enforce validations, except for F&P [#2628](https://github.com/studentinsights/studentinsights/pull/2628) [#2630](https://github.com/studentinsights/studentinsights/pull/2630)
- **Reading**: Mark older data points about DIBELS and F&P on profile page [#2631](https://github.com/studentinsights/studentinsights/pull/2631)
- **Reading**: Include FSF on profile [#2633](https://github.com/studentinsights/studentinsights/pull/2633)
- **Reading**: Update importer job for daily automation [#2640](https://github.com/studentinsights/studentinsights/pull/2640) [#2641](https://github.com/studentinsights/studentinsights/pull/2641)
- **Sections**: Refactor to allow sections in New Bedford middle schools [#2612](https://github.com/studentinsights/studentinsights/pull/2612)
- **Sections**: Rename to Sections from My sections [#2635](https://github.com/studentinsights/studentinsights/pull/2635)
- **Sections**: Show school on section page and list [#2638](https://github.com/studentinsights/studentinsights/pull/2638)
- **New Bedford**: Temporary sections importer [#2613](https://github.com/studentinsights/studentinsights/pull/2613) [#2634](https://github.com/studentinsights/studentinsights/pull/2634)
- **Permissions**: Add way for project leads to see which educators can access a specific student profile [#2637](https://github.com/studentinsights/studentinsights/pull/2637) [#2639](https://github.com/studentinsights/studentinsights/pull/2639) doc


Friday 9/20 updates:
- **Monitoring**: Stricter throttling on Rollbar to guard against bugs in browser extensions [#2603](https://github.com/studentinsights/studentinsights/pull/2603)
- **Notes audit**: Allow limiting sample to unrestricted notes [#2604](https://github.com/studentinsights/studentinsights/pull/2604)
- **Searchbar**: Fix sort order on educator searchbar, and flaky spec [#2605](https://github.com/studentinsights/studentinsights/pull/2605)
- **Counselor meeting**: Default sort order to last seen [#2606](https://github.com/studentinsights/studentinsights/pull/2606)
- **New Bedford**: Update school scoping for trainings [#2608](https://github.com/studentinsights/studentinsights/pull/2608) [#2609](https://github.com/studentinsights/studentinsights/pull/2609) [#2610](https://github.com/studentinsights/studentinsights/pull/2610)
- **Sections**: Improve header and navigation to other sections [#2615](https://github.com/studentinsights/studentinsights/pull/2615) [#2617](https://github.com/studentinsights/studentinsights/pull/2617) [#2618](https://github.com/studentinsights/studentinsights/pull/2618)
- **Reading**: Sheets Import and Process prototype [#2523](https://github.com/studentinsights/studentinsights/pull/2523)
- **Reading**: Updates for importer in first test runs [#2616](https://github.com/studentinsights/studentinsights/pull/2616)


Friday 9/13 updates:
- **District overview**: Reading links should respect feature switches [#2597](https://github.com/studentinsights/studentinsights/pull/2597)
- **My students**: Add homeroom column and filter [#2598](https://github.com/studentinsights/studentinsights/pull/2598) [#2599](https://github.com/studentinsights/studentinsights/pull/2599)
- **Reading**: Template migration scripts [#2600](https://github.com/studentinsights/studentinsights/pull/2600)
- **Reading**: Add thresholds page, update some thresholds [#2601](https://github.com/studentinsights/studentinsights/pull/2601)
- **Reading**: Update MegaReadingImporter to 8/20/19 template format [#2544](https://github.com/studentinsights/studentinsights/pull/2544)
- **Reading**: Fix grade comparison to thresholds in debug view [#2602](https://github.com/studentinsights/studentinsights/pull/2602)


Friday 9/6 updates:
- **Import**: Set up service accounts for Somerville for automated imports from Google Drive
- **Student Voice importer**: Automate import each night [#2579](https://github.com/studentinsights/studentinsights/pull/2579) [#2580](https://github.com/studentinsights/studentinsights/pull/2580) [#2582](https://github.com/studentinsights/studentinsights/pull/2582)
- **Student voice**: Add cards into home feed for fall surveys [#2581](https://github.com/studentinsights/studentinsights/pull/2581)
- **Authorizer**: Update homeroom method to be built from student methods [#2584](https://github.com/studentinsights/studentinsights/pull/2584) [#2585](https://github.com/studentinsights/studentinsights/pull/2585) [#2586](https://github.com/studentinsights/studentinsights/pull/2586) [#2587](https://github.com/studentinsights/studentinsights/pull/2587)
- **Homeroom**: Update URLs and navigation to use id only, not slugs [#2588](https://github.com/studentinsights/studentinsights/pull/2588) [#2589](https://github.com/studentinsights/studentinsights/pull/2589) [#2590](https://github.com/studentinsights/studentinsights/pull/2590) [#2591](https://github.com/studentinsights/studentinsights/pull/2591) [#2592](https://github.com/studentinsights/studentinsights/pull/2592)
- **Transitions**: Add importers for Bedford school transition notes and services [#2543](https://github.com/studentinsights/studentinsights/pull/2543) [#2596](https://github.com/studentinsights/studentinsights/pull/2596)

Friday 8/30 updates:
- **Counselor meetings**: Update inline profile to have clearer links to full profile [#2552](https://github.com/studentinsights/studentinsights/pull/2552)
- **Section exports**: Update Somerville section exports to query for school year [#2550](https://github.com/studentinsights/studentinsights/pull/2550)
- **Section importers**: Update to explicitly scope by district_school_year [#2551](https://github.com/studentinsights/studentinsights/pull/2551)
- **Permissions tools**: Show educator labels [#2553](https://github.com/studentinsights/studentinsights/pull/2553)
- **Permissions tools**: Add all educators with restricted notes access to sensitive users [#2557](https://github.com/studentinsights/studentinsights/pull/2557)
- **Educator home page view**: Show missing_from_last_export [#2548](https://github.com/studentinsights/studentinsights/pull/2548)
- **Educators**: Allow whitelisting as active even when not in latest export [#2549](https://github.com/studentinsights/studentinsights/pull/2549)
- **Precompute**: Limit to active educators [#2573](https://github.com/studentinsights/studentinsights/pull/2573)
- **Monitoring**: Add debugKey to RollbarErrorBoundary [#2560](https://github.com/studentinsights/studentinsights/pull/2560)
- **Monitoring**: Include displayName in production build [#2561](https://github.com/studentinsights/studentinsights/pull/2561)
- **Monitoring**: Send error objects to Rollbar separately so it can serialize [#2569](https://github.com/studentinsights/studentinsights/pull/2569)
- **Monitoring**: Adjust how RecordSyncer reports alerts [#2570](https://github.com/studentinsights/studentinsights/pull/2570)
- **Transition notes**: Add more specs for reading restricted notes, update… [#2565](https://github.com/studentinsights/studentinsights/pull/2565)
- **Transition notes**: Update branching in UI for show restricted note [#2566](https://github.com/studentinsights/studentinsights/pull/2566)
- **Maintenance**: Update static error pages, email links [#2567](https://github.com/studentinsights/studentinsights/pull/2567)
- **Performance**: Optimize authorized students query for lower-access users [#2574](https://github.com/studentinsights/studentinsights/pull/2574)
- **Home page feed**: Show homerooms for all schools but SHS [#2568](https://github.com/studentinsights/studentinsights/pull/2568)
- **Sign in**: Add another layer of defense on our side, whether educator is active [#2572](https://github.com/studentinsights/studentinsights/pull/2572)
- **Profile insights**: Update SHS prioritization to include fall and spring [#2575](https://github.com/studentinsights/studentinsights/pull/2575)

Friday 8/23 updates:
- **Project lead tools**: Optimize district homerooms, improve layout on permissions pages [#2545](https://github.com/studentinsights/studentinsights/pull/2545)
- **Educators import**: Mark `missing_from_last_export` and show project leads in permissions tools [#2546](https://github.com/studentinsights/studentinsights/pull/2546)
- **Transition**: Printable transition notes for 8th to 9th grade transition in Somerville

Friday 8/16 updates:
- **Service**: Add Bedford service types, part2 [#2537](https://github.com/studentinsights/studentinsights/pull/2537)

Friday 8/9 updates:
- none to share

Friday 8/2 updates:
- **Transition**: Bedford social emotional transition notes processor [#2534](https://github.com/studentinsights/studentinsights/pull/2534)
- **Service**: Add Bedford service types, part1 [#2535](https://github.com/studentinsights/studentinsights/pull/2535)

Friday 7/26 updates:
- **Services**: Update sort for timeline column [#2527](https://github.com/studentinsights/studentinsights/pull/2527)
- **Notes**: Processors for self-serve note imports [#2528](https://github.com/studentinsights/studentinsights/pull/2528)
- **Bedford**: Clarify naming for transition processor and importer [#2533](https://github.com/studentinsights/studentinsights/pull/2533)

Friday 7/19 updates:
- **Search**: Allow web search syntax when searching notes [#2521](https://github.com/studentinsights/studentinsights/pull/2521)
- **New Bedford Assessments**: Updates for MCAS and ACCESS [#2522](https://github.com/studentinsights/studentinsights/pull/2522)
- **Monitoring**: Rollbar functions can't be called without explicitly setting 'this' [#2524](https://github.com/studentinsights/studentinsights/pull/2524)
- **Somerville**: Disable STAR importer [#2526](https://github.com/studentinsights/studentinsights/pull/2526)

Friday 7/12 updates:
- **District**: Add links to debug reading pages [#2518](https://github.com/studentinsights/studentinsights/pull/2518)
- **Docs**: Update README [#2520](https://github.com/studentinsights/studentinsights/pull/2520)

Friday 7/5 updates:
- **District**: Add discipline exporter for further analysis [#2514](https://github.com/studentinsights/studentinsights/pull/2514)
- **Import**: GoogleSheetsFetcher for importing batches of sheets and folders [#2515](https://github.com/studentinsights/studentinsights/pull/2515)
- **Bedford transition**: Import Davis transition notes [#2516](https://github.com/studentinsights/studentinsights/pull/2516)
- **Services**: Show searchable, filterable list of all services for authorized students [#2517](https://github.com/studentinsights/studentinsights/pull/2517)

Friday 6/28 updates:
- **District admin**: Export 'wide' students spreadsheet [#2507](https://github.com/studentinsights/studentinsights/pull/2507)
- **Security**: Add SECURITY.md with note about responsible disclosure [#2509](https://github.com/studentinsights/studentinsights/pull/2509)
- **Security**: Send security alert email to educator on potentially suspicious login [#2508](https://github.com/studentinsights/studentinsights/pull/2508)
- **Security**: Update robots.txt to show icon, logo and description [#2510](https://github.com/studentinsights/studentinsights/pull/2510)
- **Import**: Add DataFlow descriptions to importer classes, with tests, for making visible in UI [#2511](https://github.com/studentinsights/studentinsights/pull/2511)
- **Student voice**: Import and show student voice prompts for Bedford middle schoolers [#2512](https://github.com/studentinsights/studentinsights/pull/2512)

Friday 6/21 updates:
- none to share

Friday 6/14 updates:
- **Reader profile**: months ago, multiple chips for services [#2500](https://github.com/studentinsights/studentinsights/pull/2500)
- **Reader Profile**: Moving parsing and segmenting IEP text to server [#2501](https://github.com/studentinsights/studentinsights/pull/2501)
- **Transitions**: Add label to allow editing; fix bug with starred in edit dialog [#2502](https://github.com/studentinsights/studentinsights/pull/2502)
- **District**: List of homerooms by grade [#2503 [#2504](https://github.com/studentinsights/studentinsights/pull/2504)
- **Transitions**: Fix IE11 layout bug on dialog [#2505](https://github.com/studentinsights/studentinsights/pull/2505)
- **Reading**: Add Heggerty intervention processor, show in profile [#2506](https://github.com/studentinsights/studentinsights/pull/2506)

Friday 6/7 updates:
- **Reader profile**: Initial prototype for design work [#2493](https://github.com/studentinsights/studentinsights/pull/2493) [#2494](https://github.com/studentinsights/studentinsights/pull/2494) [#2496](https://github.com/studentinsights/studentinsights/pull/2496)
- **Transition notes**: Support limited transition from 5th > 6th in Somerville [#2495](https://github.com/studentinsights/studentinsights/pull/2495) [#2497](https://github.com/studentinsights/studentinsights/pull/2497) [#2498](https://github.com/studentinsights/studentinsights/pull/2498) 
- **My Students**: Fix sort order for program [#2499](https://github.com/studentinsights/studentinsights/pull/2499)

Friday 5/31 updates:
- **Transition notes**: Add link on home page, and page to review all notes [#2481](https://github.com/studentinsights/studentinsights/pull/2481)
- **Transition notes**: Simplified inline read path, refactoring RestrictedNotePresence [#2482](https://github.com/studentinsights/studentinsights/pull/2482)
- **Transition notes**: Show new transition inline in profile list after saving [#2483](https://github.com/studentinsights/studentinsights/pull/2483)
- **Searchbar**: Mitigations for searching through many students [#2484](https://github.com/studentinsights/studentinsights/pull/2484)
- **Student searchbar**: Migrate to React component and optimize for larger lists [#2485](https://github.com/studentinsights/studentinsights/pull/2485) [#2487](https://github.com/studentinsights/studentinsights/pull/2487)
- **Counselor Meetings**: Add link to navbar, fix sort by with 'seen by' [#2489](https://github.com/studentinsights/studentinsights/pull/2489)
- **Bedford transition**: Initial processor code, prototype read path for notes and insight box [#2488](https://github.com/studentinsights/studentinsights/pull/2488)
- **New Bedford photos**: Set up and run import for Normandin students, improve zoom photo cropping [#2490](https://github.com/studentinsights/studentinsights/pull/2490)
- **Transitions**: Update filters for transitions page [#2491](https://github.com/studentinsights/studentinsights/pull/2491)

Friday 5/24 updates:
- **Counselor Meetings**: Add initial version for feedback and testing [#2477](https://github.com/studentinsights/studentinsights/pull/2477)
- **Transition Notes**: Add dialog for transition notes, refactoring for my notes, migrations for previous [#2480](https://github.com/studentinsights/studentinsights/pull/2480)

Friday 5/17 updates:
- **Reading**: Debug page for STAR coverage and distributions [#2470](https://github.com/studentinsights/studentinsights/pull/2470)
- **Maintenance**:  Update brakeman, force SSL in two places [#2471](https://github.com/studentinsights/studentinsights/pull/2471)
- **Reading**: Allow reviewing more assessments in /reading/debug [#2472](https://github.com/studentinsights/studentinsights/pull/2472)
- **Reading**: Enable exporting reading debug data [#2475](https://github.com/studentinsights/studentinsights/pull/2475)

Friday 5/10 updates:
- **Class lists**: Update link to video and PDF [#2452](https://github.com/studentinsights/studentinsights/pull/2452)
- **Class lists**: Use CleanSlateMessage and apply policy to notes within dialog [#2453](https://github.com/studentinsights/studentinsights/pull/2453)
- **Class list**: Fix bug with branching on STAR/DIBELS in profile [#2454](https://github.com/studentinsights/studentinsights/pull/2454)
- **Class lists**: Revise MegaReadingImporter for use with aggregate K and 1 reading data [#2455](https://github.com/studentinsights/studentinsights/pull/2455)
- **Class lists**: Differences in Somerville Reading Data doc / mega
- **Class lists**: Add F&P English winter benchmarks for K and 1st grade teams [#2456](https://github.com/studentinsights/studentinsights/pull/2456)
- **Class lists**: Alphabetical sort for educators list [#2457](https://github.com/studentinsights/studentinsights/pull/2457)
- **Class lists**: Remove link to school page on list page [#2458](https://github.com/studentinsights/studentinsights/pull/2458)
- **Class lists**: Improve matching fading out 'homeroom' as default list [#2461](https://github.com/studentinsights/studentinsights/pull/2461)
- **Class lists**: Update list to be narrower with short school names and shorter dates [#2462](https://github.com/studentinsights/studentinsights/pull/2462)
- **Class lists**: Photos authorization [#2465](https://github.com/studentinsights/studentinsights/pull/2465)
- **Equity experiments**: Add more durable links to experiments [#2464](https://github.com/studentinsights/studentinsights/pull/2464)
- **Memory**: Start migrating searchbar JSON out of Educator model [#2459](https://github.com/studentinsights/studentinsights/pull/2459)
- **Memory**: Finish migration for student searchbar off Educator model [#2460](https://github.com/studentinsights/studentinsights/pull/2460)
- **Maintenance**: Destroy older database instances after Postgres upgrade
- **Reading**: Refactor to clarify importers, placeholder reading importer for Somerville [#2468](https://github.com/studentinsights/studentinsights/pull/2468)
- **Reading**: Add debug view for seeing progress and global distributions [#2467](https://github.com/studentinsights/studentinsights/pull/2467)

Friday 5/3 updates:
- **Class lists**: Open for making lists KF-8 and include early childhood schools [#2443](https://github.com/studentinsights/studentinsights/pull/2443)
- **Class lists**: Enable naming lists for other purposes (eg, science classes) [#2444](https://github.com/studentinsights/studentinsights/pull/2444)
- **Class lists**: Add student photo to class list creator [#2448](https://github.com/studentinsights/studentinsights/pull/2448)
- **Class list**: Expand fix, sort columns, and revised inline profile design [#2449](https://github.com/studentinsights/studentinsights/pull/2449)
- **Class list**: Add equity check for diversity groups [#2451](https://github.com/studentinsights/studentinsights/pull/2451)
- **Equity**: Add quilts experiment visualization [#2450](https://github.com/studentinsights/studentinsights/pull/2450)

Friday 4/26 updates:
- none to share

Friday 4/19 updates:
- (school vacation week)

Friday 4/12 updates:
- none to share

Friday 4/5 updates:
- none to share

Friday 3/29 updates:
- **Photos**: Update to use cropped on homeroom page, release on home page [#2435](https://github.com/studentinsights/studentinsights/pull/2435)
- **Section, My Students**: Add student photo, cropped small [#2436](https://github.com/studentinsights/studentinsights/pull/2436)
- **Profile**: Update UX for creating and editing notes [#2437](https://github.com/studentinsights/studentinsights/pull/2437)
- **Layout**: Update min-width on body, navbar sizing [#2440](https://github.com/studentinsights/studentinsights/pull/2440)

Friday 3/22 updates:
- **Notes**: Remove older props no longer used for restricted note [#2431](https://github.com/studentinsights/studentinsights/pull/2431)
- **Authorization**: Update authorizer to expose reason why educator is authorized [#2430](https://github.com/studentinsights/studentinsights/pull/2430)
- **Home page feed**: Allow flag for showing photos [#2432](https://github.com/studentinsights/studentinsights/pull/2432)

Friday 3/15 updates:
- **SHS Levels**: Add filter for counselors [#2426](https://github.com/studentinsights/studentinsights/pull/2426)
- **Maintenance**: Add favicon path [#2427](https://github.com/studentinsights/studentinsights/pull/2427)
- **Security**: Add zxcvbn for checking password entropy [357b40](https://github.com/studentinsights/studentinsights/commit/357b40)
- **Security**: Warn on suspicious login, after long period of inactivity [24122f](https://github.com/studentinsights/studentinsights/commit/24122f)
- **Security**: Update Rails to 5.2.2.1 to patch vulnerabilities
- **Security**: Update Brakeman [#2428](https://github.com/studentinsights/studentinsights/pull/2428)
- **Security**: Security and Privacy Assessment (quarterly, not public)
- **Security**: Update Devise to 4.6.1 to patch vulnerability [5e0a29](https://github.com/studentinsights/studentinsights/commit/5e0a29)

Friday 3/8 updates:
- **Sign in**: Revise session expired copy [#2423](https://github.com/studentinsights/studentinsights/pull/2423)
- **Sign in**: Feedback while signing in, using rails-ujs [#2425](https://github.com/studentinsights/studentinsights/pull/2425)
- **Profile PDF**: Update to allow restricted notes, revise styling and layout [#2424](https://github.com/studentinsights/studentinsights/pull/2424)
- **Security**: Add audits for vulnerabilities in Ruby dependencies [#2422](https://github.com/studentinsights/studentinsights/pull/2422)
- **Security**: Upgrade for RubyGems vulnerabilities link

Friday 3/1 updates:
- **Sign in**: Release new sign in page [#2405](https://github.com/studentinsights/studentinsights/pull/2405)
- **Collaboration**: SHS Counseling Team workshop [slides](https://drive.google.com/file/d/1wIHDRi1Jbk7kwgMXuAgj416hxHZAQdqR/view)

Friday 2/22 updates:
- (school vacation week)

Friday 2/15 updates:
- **Class lists**: Revise analysis to consider separate programs
- **Student voice**: Share summary on status for surveys
- **Profile**: Rework state for text while taking notes to remove lag [#2415](https://github.com/studentinsights/studentinsights/pull/2415)
- **Profile**: Remove second 'ago' suffix from testing tab to prevent overflow [#2416](https://github.com/studentinsights/studentinsights/pull/2416)
- **Session renewal**: Update debug logging [#2417](https://github.com/studentinsights/studentinsights/pull/2417)
- **Maintenance**: Upgrade to jQuery 3.3 [#2411](https://github.com/studentinsights/studentinsights/pull/2411)
- **Maintenance**: Update font files [#2419](https://github.com/studentinsights/studentinsights/pull/2419)
- **Maintenance**: Guard sessionStorage usage more [#2418](https://github.com/studentinsights/studentinsights/pull/2418)
- **Maintenance**: Upgrade databases to Postgres 11.2

Friday 2/8 updates:
- **Student voice**: Decouple profile insights and grades reflection switches [#2392](https://github.com/studentinsights/studentinsights/pull/2392)
- **Student voice**: Fix timezone parsing in importing form timestamps [#2393](https://github.com/studentinsights/studentinsights/pull/2393)
- **Student voice**: Show start-of-year survey in notes feed [#2396](https://github.com/studentinsights/studentinsights/pull/2396)
- **Student voice**: Update differences between what shows in profile notes / profile insights [#2400](https://github.com/studentinsights/studentinsights/pull/2400)
- **Whole-child**: Prototype embedding video clips from student of the quarter awards
- **Maintenance**: Upgrade to React 16.7, add RollbarErrorBoundary [#2397](https://github.com/studentinsights/studentinsights/pull/2397)
- **Sign in**: Preview that sign-in page will change soon [#2403](https://github.com/studentinsights/studentinsights/pull/2403)
- **K8 update email**: Discipline patterns tool and finding 504 plan accommodations
- **Design**: Update favicon! [#2404](https://github.com/studentinsights/studentinsights/pull/2404)

Friday 2/1 updates:
- **Student voice**: Import mid-year survey, show on profile notes [#2379](https://github.com/studentinsights/studentinsights/pull/2379)
- **Student voice**: Add Q2 self-reflection to profile notes [#2381](https://github.com/studentinsights/studentinsights/pull/2381)
- **Student voice**: Add profile insights from winter student voice surveys [#2383](https://github.com/studentinsights/studentinsights/pull/2383)
- **Student voice**: Highlight new student voice surveys in home feed [#2382](https://github.com/studentinsights/studentinsights/pull/2382)
- **Student voice**: Add self-reflection on Q2 next to grades [#2384](https://github.com/studentinsights/studentinsights/pull/2384)
- **Student voice**: Fix timezone bug on imports; release profile insights with feature switch for Q2 self-reflection [#2387](https://github.com/studentinsights/studentinsights/pull/2387)
- **Access importer**: guard against nil values upstream [#2380](https://github.com/studentinsights/studentinsights/pull/2380)
- **Website**: Cap maximum size of photos [#2385](https://github.com/studentinsights/studentinsights/pull/2385)
- **Website**: Add privacy policy [#2386](https://github.com/studentinsights/studentinsights/pull/2386)
- **Profile**: Fix bug with rendering IepDialog in Bedford [#2376](https://github.com/studentinsights/studentinsights/pull/2376)
- **Profile**: Restrict student discipline scatter plot to school year [#2373](https://github.com/studentinsights/studentinsights/pull/2373)
- **Session renewal**: Rework to probe server to warn about session expiration instead of using heuristic [#2377](https://github.com/studentinsights/studentinsights/pull/2377)
- **Session renewal**: Fix bug from IE11 fetch polyfill [#2389](https://github.com/studentinsights/studentinsights/pull/2389)
- **Discipline**: Removing n+1 queries in discipline dashboard [#2375](https://github.com/studentinsights/studentinsights/pull/2375)
- **Discipline**: Dashboard release [#2374](https://github.com/studentinsights/studentinsights/pull/2374)


Friday 1/25 updates:
- **Reading**: Update grouping page to include computations, cut points, and click to see more [#2363](https://github.com/studentinsights/studentinsights/pull/2363)
- **Reading**: Reading**: Iterations on grouping UI styling and feel [#2367](https://github.com/studentinsights/studentinsights/pull/2367)
- **Login**: Revise timing for SessionRenewal to actually enable renewing [#2366](https://github.com/studentinsights/studentinsights/pull/2366)
- **Reading**: Reading**: store grouping state locally, snapshot grouping state and post to server [#2368](https://github.com/studentinsights/studentinsights/pull/2368)
- **Discipline**:  Add discipline code back to filter [#2365](https://github.com/studentinsights/studentinsights/pull/2365)
- **Discipline**: Hide scatterplot for large schools [#2362](https://github.com/studentinsights/studentinsights/pull/2362)
- **Restricted notes**: Clarify that admin can also mark notes restricted [#2371](https://github.com/studentinsights/studentinsights/pull/2371)

Friday 1/18 updates:
- **Student photos**: Batch update for Somerville
- **Reading**: Allow teams to enter benchmark reading data [#2352](https://github.com/studentinsights/studentinsights/pull/2352)
- **Reading**: Minimal prototype for grouping workflow, no computation, interaction or persistence [#2360](https://github.com/studentinsights/studentinsights/pull/2360)
- **MTSS**: Add minimal semi-automated importer for MTSS referral form [#2361](https://github.com/studentinsights/studentinsights/pull/2361)
- **Discipline**: Profile Heatmap Additions [#2353](https://github.com/studentinsights/studentinsights/pull/2353)

Friday 1/11 updates:
- **Security**: Enable multi-factor authentication for Bedford project leads
- **504 plans**: Export and import 504 plans and accommodations for Somerville [#2287](https://github.com/studentinsights/studentinsights/pull/2287) [#2294](https://github.com/studentinsights/studentinsights/pull/2294) [#2302](https://github.com/studentinsights/studentinsights/pull/2302) [#2315](https://github.com/studentinsights/studentinsights/pull/2315) [#2322](https://github.com/studentinsights/studentinsights/pull/2322) [#2331](https://github.com/studentinsights/studentinsights/pull/2331) [#2347](https://github.com/studentinsights/studentinsights/pull/2347)
- **Mark note as restricted**: Allow educators to catch sensitive topics searching notes [#2304](https://github.com/studentinsights/studentinsights/pull/2304)
- **Website images**: Resize to reduce loading time

Friday 1/4 updates:
- **Website**: Tap to show full screen images on Our work page
- **Class lists**: Export data for analyzing drift and exploring questions around equity and diversity [#2342](https://github.com/studentinsights/studentinsights/pull/2342)
- **Notes**: Export anonymized sample of notes for internal analysis and training [#2343](https://github.com/studentinsights/studentinsights/pull/2343)
- **HS sports teams**: Update to reflect winter sports teams [#2345](https://github.com/studentinsights/studentinsights/pull/2345) [#2346](https://github.com/studentinsights/studentinsights/pull/2346)
- **Discipline**: Add day/time scatterplot to student profile for seeing trends [#2349](https://github.com/studentinsights/studentinsights/pull/2349)

Friday 12/21 updates:
- **Profile**: Update educator contacts to respect PerDistrict setting for counselor field [#2334](https://github.com/studentinsights/studentinsights/pull/2334)
- **Profile**: Fix bug with incorrectly showing IEP link in Bedford [#2332](https://github.com/studentinsights/studentinsights/pull/2332)
- **Profile**: Add teacher name for homeroom [#2338](https://github.com/studentinsights/studentinsights/pull/2338)
- **504 plans**: Released to SHS counseling team
- **Redesigned logo**: For website and product itself [#2292](https://github.com/studentinsights/studentinsights/pull/2292) [#2293](https://github.com/studentinsights/studentinsights/pull/2293) [#2337](https://github.com/studentinsights/studentinsights/pull/2337) [#2339](https://github.com/studentinsights/studentinsights/pull/2339)
- **Website**: Tap to show full screen images [9340cd](https://github.com/studentinsights/studentinsights/commit/9340cd)
- **Photos**: Enable student photos for Bedford [#2340](https://github.com/studentinsights/studentinsights/pull/2340)
- **Reading**: Reviewing prototype visualizations of DIBELS ORF growth in Somerville

Friday 12/14 updates:
- **Security**: Add another layer of guards protecting against inadvertent permission bugs in S3
- **Security**: Add private methods for provisioning multifactor authentication manually [#2326](https://github.com/studentinsights/studentinsights/pull/2326)
- **Profile**: Fix sort bug on grades table by educator, from an older migration [#2319](https://github.com/studentinsights/studentinsights/pull/2319)
- **Discipline**: Adding scatterplot for day/time patterns [#2242](https://github.com/studentinsights/studentinsights/pull/2242)
- **My notes**: Revise layout and add word cloud, shipped dark [#2325](https://github.com/studentinsights/studentinsights/pull/2325)
- **Notes**: Adjust note types for Bedford [#2327](https://github.com/studentinsights/studentinsights/pull/2327)

Friday 12/7 updates:
- **Security**: Update instructions to crawlers [#2281](https://github.com/studentinsights/studentinsights/pull/2281)
- **Absences**: Add "recent" to title of school absence, tardies, discipline pages [#2282](https://github.com/studentinsights/studentinsights/pull/2282)
- **Levels**: Fix sort bug for counselor note in table [#2285](https://github.com/studentinsights/studentinsights/pull/2285)
- **Security**: Upgrade Rails [80fade](https://github.com/studentinsights/studentinsights/commit/80fadea386c82a26ccaf1fcb9baccaf8ebdc7d61)
- **Reading**: Add minimal F&P and Dibels data (Somerville) [#2290](https://github.com/studentinsights/studentinsights/pull/2290)
- **Redesigned logo**: Added to public website [#2292](https://github.com/studentinsights/studentinsights/pull/2292) [#2293](https://github.com/studentinsights/studentinsights/pull/2293)
- **Accessibility**: Add more alt tags for images on home and our work [04d363](https://github.com/studentinsights/studentinsights/commit/80fadea386c82a26ccaf1fcb9baccaf8ebdc7d61)
- **504 plans**: Initial export and import data quality checks in Somerville [#2287](https://github.com/studentinsights/studentinsights/pull/2287) [#2294](https://github.com/studentinsights/studentinsights/pull/2294)

Friday 11/30 updates:
- **Security**: Upgrade to Ruby 2.5.3 [#2266](https://github.com/studentinsights/studentinsights/pull/2266)
- **Security**: Avoid logging filenames when downloading IEPs or PDFs [#2268](https://github.com/studentinsights/studentinsights/pull/2268)
- **Security**: Add another layer of tests to verify that all pages require sign on [#2269](https://github.com/studentinsights/studentinsights/pull/2269)
- **Security**: Enable multifactor authentication for all developer accounts (eg, Heroku, AWS, Google, NameCheap, Mailgun)
- **Security**: Enforce 100% test coverage on core authorization files [#2273](https://github.com/studentinsights/studentinsights/pull/2273)
- **Security**: Remove all logging for request parameters (part of [#2274](https://github.com/studentinsights/studentinsights/pull/2274))
- **Security**: Scrub all logging to error monitoring services (part of [#2274](https://github.com/studentinsights/studentinsights/pull/2274))
- **Security**: Update quarterly security assessment, reviewing OWASP ASVS and OWASP Proactive Controls
- **Security**: Enable multifactor authorization flows using Authenticator app and SMS [#2274](https://github.com/studentinsights/studentinsights/pull/2274)
- **Security**: Rollout multifactor authentication for all dev accounts and Somerville project lead
- **Security**: Review security patches and updates for all SFTP instances
- **Security**: Add ufw and fail2ban for all SFTP instances
- **Security**: Limit SFTP read permissions further to minimal user set
- **Design**: Add favicon to the site [#2272](https://github.com/studentinsights/studentinsights/pull/2272)
- **Accessibility**: Update home page to have image captions and tags for screen readers [622ce4..ad5b66](https://github.com/studentinsights/studentinsights/compare/622ce445..ad5b6627)
- **Website**: Publish at www, add @studentinsights.org email addresses

Friday 11/23 updates:
- **Security**: Add additional firewall layer for blocking and throttling login attacks [#2244](https://github.com/studentinsights/studentinsights/pull/2244)
- **Security**: Update login to have consistent response times (fd2283..f2d5ff)
- **Bug fix**: On district page, filter school codes with no active students [#2246](https://github.com/studentinsights/studentinsights/pull/2246)
- **Update note types for Bedford**: Update to support structures in Bedford [#2250](https://github.com/studentinsights/studentinsights/pull/2250)
- **Security**: Remove Google Font loader [#2263](https://github.com/studentinsights/studentinsights/pull/2263)
- **Security**: Remove Mixpanel [#2253](https://github.com/studentinsights/studentinsights/pull/2253)
- **Search notes**: Improve prototype to allow fulltext querying and searching by school and [#2252](https://github.com/studentinsights/studentinsights/pull/2252)

Friday 11/16 updates:
- **Website**: Released new website to first internal reviewers
- **Mini-internship**: Started working weekly with two SHS students
- **Search notes**: First prototype released internally

Friday 11/9 updates:
- **Bedford MCAS import**: Fix export and import of 3rd grade Math MCAS data, fix export bug with SGP [#2239](https://github.com/studentinsights/studentinsights/pull/2239)
- **Bedford MCAS profile**: Update profile to highlight MCAS since there is no STAR data [#2234](https://github.com/studentinsights/studentinsights/pull/2234)
- **Bedford**: Access for K-5 director of student achievement
- **Counselor meeting note type**: Add counselor meeting note type, for sorting, for Levels page and later for searching [#2233](https://github.com/studentinsights/studentinsights/pull/2233)
- **Levels**: Improve matching in ELA/SS for ELL courses [#2235](https://github.com/studentinsights/studentinsights/pull/2235)
- **SHS Homework help**: Import data and show on profile to start [#2236](https://github.com/studentinsights/studentinsights/pull/2236)
- **Mini-internship setup**: Starting next Thursday!

Friday 11/2 updates:
- **Profile page homeroom link bug**: Remove links to SHS homerooms that aren't meaningful and led to error pages [#2214](https://github.com/studentinsights/studentinsights/pull/2214)
- **Discipline analysis**: Add dropdown to filter by Grade, house and Counselor [#1661](https://github.com/studentinsights/studentinsights/pull/1661)
- **Discipline**: Starting HS conversation next week about major/minor incidents
- **Community Schools**: Add community schools-based feed filter [#2221](https://github.com/studentinsights/studentinsights/pull/2221)
- **Bedford MCAS**: Import MCAS data for Bedford, but not 3rd grade math yet [#2223](https://github.com/studentinsights/studentinsights/pull/2223)
- **Fix MCAS bugs**: SGP for Next Gen tests, E filter on overview [#2228](https://github.com/studentinsights/studentinsights/pull/2228) [#2226](https://github.com/studentinsights/studentinsights/pull/2226)
- **Improve SPED and ELL profile for Bedford**: Removing some data that isn't meaningful [#2217](https://github.com/studentinsights/studentinsights/pull/2217)
- **New Bedford AssessmentImporter disabled**: While fixing upstream data problems in SIS
- **Alerting**: Notify developers on import changes outside expected norms [#2213](https://github.com/studentinsights/studentinsights/pull/2213)

Friday 10/26 updates:
- **Training with Community Schools after school coordinators**: Training on writing notes and best light to grant access
- **Speed up Roster page**: Rework precomputing, but some requests are still falling through
- **Somerville student photos**: One-time import, added photos for 104 active students
- **Improved display ELL data**: ELL designations and levels, program enrollment, rubric, transition date for former English learners
- **Improved student meeting importer**: For name changes between Google/SIS/LDAP and limiting to district email addresses
- **Fix issues with export and import for students in Bedford**: Worked around export bug and improved underlying issue

Friday 10/19 updates:
- **Sports teams** show up in Insights with emoji ⚽!
- **NGE/10GE/NEST Student Meetings** show up as notes in Insights as well
- **Levels for SHS Systems and Supports** is released to all SHS teachers, link at the top of any page
- **Snapshots of grade and levels** are now taken behind the scenes so we can look at changes over time in a month or two
- **ELL-based home page feed** for HS ELL admin
