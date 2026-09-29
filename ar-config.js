export const TARGET_FILE_CANDIDATES = [
    'ar-assets/targets.mind',
    'ar-assets/cover.mind',
    'ar-assets/target.mind'
];

export const GALLERY_PHOTO_METADATA = [
    {
        id: 'regal',
        imageSrc: 'ar-assets/display/2025-regal_cinema42st.jpg',
        title: 'Regal Cinemas - Times Square',
        description: 'Times Square theater activity has returned after its pandemic closure.'
    },
    {
        id: 'nypl',
        imageSrc: 'ar-assets/display/2025-nypl.jpg',
        title: 'New York Public Library',
        description: 'Street-level view outside the New York Public Library after reopening.'
    },
    {
        id: 'nypl-lyon',
        imageSrc: 'ar-assets/display/2025-nypl_lyon.jpg',
        title: 'NYPL Lions',
        description: 'Patience and Fortitude outside NYPL in a busier city moment.'
    },
    {
        id: 'nyse',
        imageSrc: 'ar-assets/display/2025-nyse.jpg',
        title: 'New York Stock Exchange',
        description: 'Wall Street foot traffic and activity near the NYSE.'
    },
    {
        id: 'wallst-bull',
        imageSrc: 'ar-assets/display/2025-wallst_bull.jpg',
        title: 'Charging Bull',
        description: 'Lower Manhattan crowds around the iconic Wall Street bull.'
    },
    {
        id: 'timesquare-police',
        imageSrc: 'ar-assets/display/2025-timesquare_police.jpg',
        title: 'Times Square',
        description: 'A contemporary Times Square street scene with heavy pedestrian flow.'
    },
    {
        id: 'grandcentral',
        imageSrc: 'ar-assets/display/2025-grandcentral.jpg',
        title: 'Grand Central',
        description: 'Commuter movement and restored rhythm around Grand Central.'
    },
    {
        id: 'washingtonsq',
        imageSrc: 'ar-assets/display/2025-washingtonsq_park.jpg',
        title: 'Washington Square Park',
        description: 'Public life and gatherings in Washington Square Park.'
    },
    {
        id: '8ave',
        imageSrc: 'ar-assets/display/2025-8ave.jpg',
        title: '8th Avenue',
        description: 'A reopened 8th Avenue corridor with normal city traffic.'
    }
];

export const TARGET_METADATA = {
    cover: {
        indicatorLabel: 'Cover Detected',
        panelTitle: 'Temporarily Closed NYC',
        panelDescription: 'A photo zine documenting NYC locations temporarily closed during the pandemic. Scan inner pages to open the AR gallery.'
    },
    regal: {
        indicatorLabel: 'Regal Cinemas Detected',
        supportsCompare: true,
        playAudio: true
    },
    nypl: {
        indicatorLabel: 'NYPL Detected'
    },
    'nypl-lyon': {
        indicatorLabel: 'NYPL Lions Detected'
    },
    nyse: {
        indicatorLabel: 'NYSE Detected'
    },
    'wallst-bull': {
        indicatorLabel: 'Wall St Bull Detected'
    },
    'timesquare-police': {
        indicatorLabel: 'Times Square Detected'
    },
    grandcentral: {
        indicatorLabel: 'Grand Central Detected'
    },
    washingtonsq: {
        indicatorLabel: 'Washington Sq Detected'
    },
    '8ave': {
        indicatorLabel: '8th Ave Detected'
    }
};
