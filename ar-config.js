export const TARGET_FILE_CANDIDATES = [
    'ar-assets/targets.mind',
    'ar-assets/cover.mind'
];

export const GALLERY_PHOTO_METADATA = [
    {
        id: 'regal',
        imageSrc: 'images/2025-regal_cinema42st.webp',
        title: 'Regal Cinemas - Times Square',
        description: 'Times Square theater activity has returned after its pandemic closure.'
    },
    {
        id: 'nypl',
        imageSrc: 'images/2025-nypl.webp',
        title: 'New York Public Library',
        description: 'Street-level view outside the New York Public Library after reopening.'
    },
    {
        id: 'nypl-lyon',
        imageSrc: 'images/2025-nypl_lyon.webp',
        title: 'NYPL Lions',
        description: 'Patience and Fortitude outside NYPL in a busier city moment.'
    },
    {
        id: 'nyse',
        imageSrc: 'images/2025-nyse.webp',
        title: 'New York Stock Exchange',
        description: 'Wall Street foot traffic and activity near the NYSE.'
    },
    {
        id: 'wallst-bull',
        imageSrc: 'images/2025-wallst_bull.webp',
        title: 'Charging Bull',
        description: 'Lower Manhattan crowds around the iconic Wall Street bull.'
    },
    {
        id: 'timesquare-police',
        imageSrc: 'images/2025-timesquare_police.webp',
        title: 'Times Square',
        description: 'A contemporary Times Square street scene with heavy pedestrian flow.'
    },
    {
        id: 'grandcentral',
        imageSrc: 'images/2025-grandcentral.webp',
        title: 'Grand Central',
        description: 'Commuter movement and restored rhythm around Grand Central.'
    },
    {
        id: 'washingtonsq',
        imageSrc: 'images/2025-washingtonsq_park.webp',
        title: 'Washington Square Park',
        description: 'Public life and gatherings in Washington Square Park.'
    },
    {
        id: '8ave',
        imageSrc: 'images/2025-8ave.webp',
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
