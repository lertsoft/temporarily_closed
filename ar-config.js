export const TARGET_FILE_CANDIDATES = [
    'ar-assets/targets.mind',
    'ar-assets/cover.mind',
    'ar-assets/target.mind'
];

export const GALLERY_PHOTO_METADATA = [
    {
        id: 'regal',
        title: 'Regal Cinemas - Times Square',
        description: 'Times Square theater activity has returned after its pandemic closure.'
    },
    {
        id: 'nypl',
        title: 'New York Public Library',
        description: 'Street-level view outside the New York Public Library after reopening.'
    },
    {
        id: 'nypl-lyon',
        title: 'NYPL Lions',
        description: 'Patience and Fortitude outside NYPL in a busier city moment.'
    },
    {
        id: 'nyse',
        title: 'New York Stock Exchange',
        description: 'Wall Street foot traffic and activity near the NYSE.'
    },
    {
        id: 'wallst-bull',
        title: 'Charging Bull',
        description: 'Lower Manhattan crowds around the iconic Wall Street bull.'
    },
    {
        id: 'timesquare-police',
        title: 'Times Square',
        description: 'A contemporary Times Square street scene with heavy pedestrian flow.'
    },
    {
        id: 'grandcentral',
        title: 'Grand Central',
        description: 'Commuter movement and restored rhythm around Grand Central.'
    },
    {
        id: 'washingtonsq',
        title: 'Washington Square Park',
        description: 'Public life and gatherings in Washington Square Park.'
    },
    {
        id: '8ave',
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
