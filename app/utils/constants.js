'use strict';

let CONSTANTS = {};

CONSTANTS.SERVER = {
    ONE: 1
};

CONSTANTS.AVAILABLE_AUTHS = {
    ADMIN: 1,
    USER: 2,
    COMMON: 3
};

CONSTANTS.STATUS = {
    ACTIVE: 1,
    BLOCK: 2,
};

CONSTANTS.PASSWORD_PATTER_REGEX = /^(?=.{6,})(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$/;

CONSTANTS.NORMAL_PROJECTION = { __v: 0, isDeleted: 0, createdAt: 0, updatedAt: 0 };

CONSTANTS.MESSAGES = require('./messages');

CONSTANTS.SECURITY = {
    JWT_SIGN_KEY: 'fasdkfjklandfkdsfjladsfodfafjalfadsfkads',
    BCRYPT_SALT: 8,
    STATIC_TOKEN_FOR_AUTHORIZATION: '58dde3df315587b279edc3f5eeb98145'
};

CONSTANTS.ERROR_TYPES = {
    DATA_NOT_FOUND: 'DATA_NOT_FOUND',
    BAD_REQUEST: 'BAD_REQUEST',
    MONGO_EXCEPTION: 'MONGO_EXCEPTION',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
    FORBIDDEN: 'FORBIDDEN',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    SOCKET_ERROR: 'SOCKET_ERROR',
    INVALID_MOVE: 'invalidMove',
};


CONSTANTS.SOCKET_EVENTS = {
    SEND_MESSAGE:'SEND',
    JOIN_RROM:'JOIN_ROOM',
    NEW_MESSAGE:'NEW_MESSAGE'
}

CONSTANTS.USER_TYPES = {
    USER:1,
    ADMIN: 2,

};

CONSTANTS.EMAIL_SUBJECTS = {
    RESET_PASSWORD_EMAIL: "Reset Password",
    SETUP_PASSWORD: "Setup Your Password",
    EMAIL_VERIFICATION:'Email Verification.',
    INTERSTED_TO_CONTACT:'Intersted to contact.'
};

CONSTANTS.EMAIL_CONTENTS = {
    VERIFY_EMAIL : (user)=>{
       return `<p>Hello ${user.firstName} ${user.lastName}</p><br>
        
        <p>You registered an account on <a href="https://plutus.com">https://plutus.com</a>, before being able to use your account.You need to verify that this is your email address by clicking here:<a href="${user.url}" target="__blank">link</a></p><br>this link valid for 1 hour.<br>
        
        <p>Kind Regards, Plutus Team!! </p>`
    },
    CONTACT:(user)=>{
        return `<p>Hi</p><br>
        <p>This user want to contact you :</p>
        <ul>
        <li>Name :${user.name}</li>
        <li>Email :${user.senderEmail}</li>
        <li>Phone :${user.phone}</li>
        <li>Join as :${user.role}</li>
        <li>Message :${user.message}</li>
        </ul>
        <p>Kind Regards, Plutus Team!! </p>`
    },
    SUBMIT_EVENT_INFO: 'submitEventInfo'
}

CONSTANTS.GENDER_TYPES = {
    MALE: 1,
    FEMALE: 2,
    OTHER: 3,
}


CONSTANTS.CHALLENGES_TYPES = {
    PAID: 1,
    UNPAID: 2,
}

CONSTANTS.DISTANCE_TYPE = {
    METER: 1,
    KM: 2,
}

CONSTANTS.LOGIN_TYPES = {
    NORMAL: 1,
    GOOGLE: 2,
    FACEBOOK: 3
};

CONSTANTS.TOKEN_TYPES = {
    LOGIN: 1,
    RESET_PASSWORD: 2
};

CONSTANTS.EMAIL_TYPES = {
    SETUP_PASSWORD: 1,
    FORGOT_PASSWORD_EMAIL: 2,
    SEND_PAYROLL: 3,
    EMAIL_VERIFY:4,
    CONTACT_US:5
};

CONSTANTS.AVAILABLE_EXTENSIONS_FOR_FILE_UPLOADS = ['png', 'jpg', 'jpeg','pdf'];

CONSTANTS.PAGINATION = {
    DEFAULT_LIMIT: 50,
    DEFAULT_NUMBER_OF_DOCUMENTS_TO_SKIP: 0
};

CONSTANTS.TOKEN_TYPE = {
    RESET_PASSWORD: 1,
    ACTIVATE_ACCOUNT: 2,
};

CONSTANTS.ACTION_TAKEN = {
    UPDATE: 1,
    DELETE: 2,
}

CONSTANTS.DATABASE_VERSIONS = {
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
    SIX: 6,
    SEVEN: 7,
    EIGHT: 8,
    NINE: 9,
    TEN: 10,
    ELEVEN: 11,
    TWELVE: 12,
    THIRTEEN: 13,
    FOURTEEN: 14,
};

CONSTANTS.TRANSACTION_STATUS = {
    APPROVE: 1,
    REJECT: 2,
    PENDING: 3,
}

CONSTANTS.LEADERBOARD_CATEGORY = {
    WORLD: 1,
    COUNTRY: 2,
    FRIEND: 3
};

CONSTANTS.NOTIFICATION_STATUS = {
    READ: 1,
    UNREAD: 2
};

CONSTANTS.NOTIFICATION_TYPE = {
    CHALLENGE_CREATED: 1,
    FRIEND_CHALLENGE_COMPLETED: 2
};

CONSTANTS.FCM_TOPICS = {
    PUBLIC: 'testing'
}

CONSTANTS.FCM_TITLE = {
    CHALLENGE_ADDED: 'Challenge Added',
    FRIEND_CHALLENGE_COMPLETED: 'Friend Challenge Completed',
}

CONSTANTS.COUNTRY_CODE = {
  Afghanistan: '93',
  Albania: '355',
  Algeria: '213',
  'American Samoa': '1 684',
  Andorra: '376',
  Angola: '244',
  Anguilla: '1 264',
  Antarctica: '672',
  'Antigua And Barbuda': '1 268',
  Argentina: '54',
  Armenia: '374',
  Aruba: '297',
  'Ascension Island': '247',
  Australia: '61',
  Austria: '43',
  Azerbaijan: '994',
  Bahamas: '1 242',
  Bahrain: '973',
  Bangladesh: '880',
  Barbados: '1 246',
  Belarus: '375',
  Belgium: '32',
  Belize: '501',
  Benin: '229',
  Bermuda: '1 441',
  Bhutan: '975',
  'Bolivia, Plurinational State Of': '591',
  'Bonaire, Saint Eustatius And Saba': '599',
  'Bosnia & Herzegovina': '387',
  Botswana: '267',
  'Bouvet Island': '',
  Brazil: '55',
  'British Indian Ocean Territory': '246',
  'Brunei Darussalam': '673',
  Bulgaria: '359',
  'Burkina Faso': '226',
  Burundi: '257',
  Cambodia: '855',
  Cameroon: '237',
  Canada: '1',
  'Canary Islands': '',
  'Cape Verde': '238',
  'Cayman Islands': '1 345',
  'Central African Republic': '236',
  'Ceuta, Mulilla': '',
  Chad: '235',
  Chile: '56',
  China: '86',
  'Christmas Island': '61',
  'Clipperton Island': '',
  'Cocos (Keeling) Islands': '61',
  Colombia: '57',
  Comoros: '269',
  'Cook Islands': '682',
  'Costa Rica': '506',
  "Cote d'Ivoire": '225',
  Croatia: '385',
  Cuba: '53',
  Curacao: '599',
  Cyprus: '357',
  'Czech Republic': '420',
  'Democratic Republic Of Congo': '243',
  Denmark: '45',
  'Diego Garcia': '',
  Djibouti: '253',
  Dominica: '1 767',
  'Dominican Republic': '1 809',
  'East Timor': '670',
  Ecuador: '593',
  Egypt: '20',
  'El Salvador': '503',
  'Equatorial Guinea': '240',
  Eritrea: '291',
  Estonia: '372',
  Ethiopia: '251',
  'European Union': '388',
  'Falkland Islands': '500',
  'Faroe Islands': '298',
  Fiji: '679',
  Finland: '358',
  France: '33',
  'France, Metropolitan': '241',
  'French Guiana': '44',
  'French Polynesia': '689',
  'French Southern Territories': '',
  Gabon: '44',
  Gambia: '220',
  Georgia: '594',
  Germany: '49',
  Ghana: '233',
  Gibraltar: '350',
  Greece: '30',
  Greenland: '299',
  Grenada: '995',
  Guadeloupe: '590',
  Guam: '1 671',
  Guatemala: '502',
  Guernsey: '',
  Guinea: '224',
  'Guinea-bissau': '245',
  Guyana: '592',
  Haiti: '509',
  'Heard Island And McDonald Islands': '',
  Honduras: '504',
  'Hong Kong': '852',
  Hungary: '36',
  Iceland: '354',
  India: '91',
  Indonesia: '62',
  'Iran, Islamic Republic Of': '98',
  Iraq: '964',
  Ireland: '353',
  'Isle Of Man': '44',
  Israel: '972',
  Italy: '39',
  Jamaica: '1 876',
  Japan: '81',
  Jersey: '44',
  Jordan: '962',
  Kazakhstan: '7',
  Kenya: '254',
  Kiribati: '686',
  "Korea, Democratic People's Republic Of": '850',
  'Korea, Republic Of': '82',
  Kuwait: '965',
  Kyrgyzstan: '996',
  "Lao People's Democratic Republic": '856',
  Latvia: '371',
  Lebanon: '961',
  Lesotho: '266',
  Liberia: '231',
  Libya: '218',
  Liechtenstein: '423',
  Lithuania: '370',
  Luxembourg: '352',
  Macao: '853',
  'Macedonia, The Former Yugoslav Republic Of': '389',
  Madagascar: '261',
  Malawi: '265',
  Malaysia: '60',
  Maldives: '960',
  Mali: '223',
  Malta: '356',
  'Marshall Islands': '692',
  Martinique: '596',
  Mauritania: '222',
  Mauritius: '230',
  Mayotte: '262',
  Mexico: '52',
  'Micronesia, Federated States Of': '691',
  Moldova: '373',
  Monaco: '377',
  Mongolia: '976',
  Montenegro: '382',
  Montserrat: '1 664',
  Morocco: '212',
  Mozambique: '258',
  Myanmar: '95',
  Namibia: '264',
  Nauru: '674',
  Nepal: '977',
  Netherlands: '31',
  'New Caledonia': '687',
  'New Zealand': '64',
  Nicaragua: '505',
  Niger: '227',
  Nigeria: '234',
  Niue: '683',
  'Norfolk Island': '672',
  'Northern Mariana Islands': '1 670',
  Norway: '47',
  Oman: '968',
  Pakistan: '92',
  Palau: '680',
  'Palestinian Territory, Occupied': '970',
  Panama: '507',
  'Papua New Guinea': '675',
  Paraguay: '595',
  Peru: '51',
  Philippines: '63',
  Pitcairn: '',
  Poland: '48',
  Portugal: '351',
  'Puerto Rico': '1 787',
  Qatar: '974',
  'Republic Of Congo': '242',
  Reunion: '262',
  Romania: '40',
  'Russian Federation': '7',
  Rwanda: '250',
  'Saint Barthélemy': '590',
  'Saint Helena, Ascension And Tristan Da Cunha': '290',
  'Saint Kitts And Nevis': '1 869',
  'Saint Lucia': '1 758',
  'Saint Martin': '590',
  'Saint Pierre And Miquelon': '508',
  'Saint Vincent And The Grenadines': '1 784',
  Samoa: '685',
  'San Marino': '378',
  'Sao Tome And Principe': '239',
  'Saudi Arabia': '966',
  Senegal: '221',
  Serbia: '381',
  Seychelles: '248',
  'Sierra Leone': '232',
  Singapore: '65',
  'Sint Maarten': '1 721',
  Slovakia: '421',
  Slovenia: '386',
  'Solomon Islands': '677',
  Somalia: '252',
  'South Africa': '27',
  'South Georgia And The South Sandwich Islands': '',
  Spain: '34',
  'Sri Lanka': '94',
  Sudan: '249',
  Suriname: '597',
  'Svalbard And Jan Mayen': '47',
  Swaziland: '268',
  Sweden: '46',
  Switzerland: '41',
  'Syrian Arab Republic': '963',
  'Taiwan, Province Of China': '886',
  Tajikistan: '992',
  'Tanzania, United Republic Of': '255',
  Thailand: '66',
  Togo: '228',
  Tokelau: '690',
  Tonga: '676',
  'Trinidad And Tobago': '1 868',
  'Tristan de Cunha': '290',
  Tunisia: '216',
  Turkey: '90',
  Turkmenistan: '993',
  'Turks And Caicos Islands': '1 649',
  Tuvalu: '688',
  USSR: '',
  Uganda: '256',
  Ukraine: '380',
  'United Arab Emirates': '971',
  'United Kingdom': '',
  'United States': '1',
  'United States Minor Outlying Islands': '',
  Uruguay: '598',
  Uzbekistan: '998',
  Vanuatu: '678',
  'Vatican City State': '379',
  'Venezuela, Bolivarian Republic Of': '58',
  'Viet Nam': '84',
  'Virgin Islands (British)': '1 284',
  'Virgin Islands (US)': '1 340',
  'Wallis And Futuna': '681',
  'Western Sahara': '212',
  Yemen: '967',
  Zambia: '260',
  Zimbabwe: '263'
}

module.exports = CONSTANTS;