import cron from 'node-cron';
import prisma from '../../shared/prisma';
import { DEMO_USER_EMAILS } from '../modules/User/user.constant';

export const demoInfoCreateJob = () => {
    cron.schedule('0 0 1 * *', async () => { // 0 0 1 * * // * * * * *
        const demoUser = await prisma.user.findFirstOrThrow({
            where: {
                email: DEMO_USER_EMAILS.USER
            },
            select: {
                id: true
            }
        })

        const demoOrganizer = await prisma.user.findFirstOrThrow({
            where: {
                email: DEMO_USER_EMAILS.ORGANIZER
            },
            select: {
                id: true
            }
        })

        const demoAdmin = await prisma.user.findFirstOrThrow({
            where: {
                email: DEMO_USER_EMAILS.ADMIN
            },
            select: {
                id: true
            }
        })

        // Predefined demo event data
        const demoEventsCreate = await prisma.events.createMany({
            data: [
                {
                    organizerId: demoOrganizer.id,
                    title: 'Tech Conference 2026',
                    coverPhoto: "https://res.cloudinary.com/dxbpbbpbh/image/upload/v1772428697/download%20%281%29-1772428694900-496498378.jpg",
                    description: 'A large-scale tech conference focusing on future trends.',
                    date_time: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
                    venue: 'Tech Arena',
                    location: 'New York, NY',
                    is_public: true,
                    is_paid: false,
                    registration_fee: 0,
                    status: 'UPCOMING'
                },
                {
                    organizerId: demoOrganizer.id,
                    title: 'Startup Pitch Event',
                    coverPhoto: "https://res.cloudinary.com/dxbpbbpbh/image/upload/v1772428697/download%20%281%29-1772428694900-496498378.jpg",
                    description: 'A pitch event for early-stage startups.',
                    date_time: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
                    venue: 'Innovation Hub',
                    location: 'San Francisco, CA',
                    is_public: true,
                    is_paid: true,
                    registration_fee: 20,
                    status: 'UPCOMING'
                },
                {
                    organizerId: demoOrganizer.id,
                    title: 'Networking Night',
                    coverPhoto: "https://res.cloudinary.com/dxbpbbpbh/image/upload/v1772428697/download%20%281%29-1772428694900-496498378.jpg",
                    description: 'An informal networking event for professionals.',
                    date_time: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
                    venue: 'Downtown Hotel',
                    location: 'Los Angeles, CA',
                    is_public: true,
                    is_paid: false,
                    registration_fee: 0,
                    status: 'UPCOMING'
                },
                {
                    organizerId: demoOrganizer.id,
                    title: 'Design Workshop',
                    coverPhoto: "https://res.cloudinary.com/dxbpbbpbh/image/upload/v1772428697/download%20%281%29-1772428694900-496498378.jpg",
                    description: 'A workshop on the latest in graphic design.',
                    date_time: new Date(new Date().getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days from now
                    venue: 'Creative Space',
                    location: 'Chicago, IL',
                    is_public: true,
                    is_paid: true,
                    registration_fee: 50,
                    status: 'UPCOMING'
                },
                {
                    organizerId: demoOrganizer.id,
                    title: 'Hackathon 2026',
                    coverPhoto: "https://res.cloudinary.com/dxbpbbpbh/image/upload/v1772428697/download%20%281%29-1772428694900-496498378.jpg",
                    description: '24-hour coding competition with great prizes.',
                    date_time: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
                    venue: 'Tech Labs',
                    location: 'Austin, TX',
                    is_public: true,
                    is_paid: true,
                    registration_fee: 30,
                    status: 'UPCOMING'
                },
                {
                    organizerId: demoOrganizer.id,
                    title: 'AI Symposium',
                    coverPhoto: "https://res.cloudinary.com/dxbpbbpbh/image/upload/v1772428697/download%20%281%29-1772428694900-496498378.jpg",
                    description: 'An event dedicated to the advancements in AI.',
                    date_time: new Date(new Date().getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days from now
                    venue: 'AI Research Center',
                    location: 'Boston, MA',
                    is_public: true,
                    is_paid: false,
                    registration_fee: 0,
                    status: 'UPCOMING'
                },
                {
                    organizerId: demoOrganizer.id,
                    title: 'Tech Talk: Cloud Computing',
                    coverPhoto: "https://res.cloudinary.com/dxbpbbpbh/image/upload/v1772428697/download%20%281%29-1772428694900-496498378.jpg",
                    description: 'A technical talk about the future of cloud computing.',
                    date_time: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
                    venue: 'Cloud Innovation Center',
                    location: 'Seattle, WA',
                    is_public: true,
                    is_paid: true,
                    registration_fee: 15,
                    status: 'UPCOMING'
                },
                {
                    organizerId: demoOrganizer.id,
                    title: 'Blockchain Meetup',
                    coverPhoto: "https://res.cloudinary.com/dxbpbbpbh/image/upload/v1772428697/download%20%281%29-1772428694900-496498378.jpg",
                    description: 'A meetup for blockchain enthusiasts.',
                    date_time: new Date(new Date().getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days from now
                    venue: 'Crypto Hub',
                    location: 'Miami, FL',
                    is_public: true,
                    is_paid: false,
                    registration_fee: 0,
                    status: 'UPCOMING'
                },
                {
                    organizerId: demoOrganizer.id,
                    title: 'Web Development Bootcamp',
                    coverPhoto: "https://res.cloudinary.com/dxbpbbpbh/image/upload/v1772428697/download%20%281%29-1772428694900-496498378.jpg",
                    description: 'A bootcamp for aspiring web developers.',
                    date_time: new Date(new Date().getTime() + 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days from now
                    venue: 'Web Dev Academy',
                    location: 'Dallas, TX',
                    is_public: true,
                    is_paid: true,
                    registration_fee: 100,
                    status: 'UPCOMING'
                },
                {
                    organizerId: demoOrganizer.id,
                    title: 'Cybersecurity Conference',
                    coverPhoto: "https://res.cloudinary.com/dxbpbbpbh/image/upload/v1772428697/download%20%281%29-1772428694900-496498378.jpg",
                    description: 'A conference on the latest in cybersecurity.',
                    date_time: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
                    venue: 'Security Expo Center',
                    location: 'Washington, D.C.',
                    is_public: true,
                    is_paid: false,
                    registration_fee: 0,
                    status: 'UPCOMING'
                },
                // New 10 events with is_public: false
                {
                    organizerId: demoOrganizer.id,
                    title: 'Private Tech Roundtable',
                    coverPhoto: "https://res.cloudinary.com/dxbpbbpbh/image/upload/v1772428697/download%20%281%29-1772428694900-496498378.jpg",
                    description: 'An exclusive roundtable for tech leaders.',
                    date_time: new Date(new Date().getTime() + 11 * 24 * 60 * 60 * 1000).toISOString(),
                    venue: 'Elite Conference Room',
                    location: 'Chicago, IL',
                    is_public: false,
                    is_paid: true,
                    registration_fee: 50,
                    status: 'UPCOMING'
                },
                {
                    organizerId: demoOrganizer.id,
                    title: 'Closed Beta Launch Event',
                    coverPhoto: "https://res.cloudinary.com/dxbpbbpbh/image/upload/v1772428697/download%20%281%29-1772428694900-496498378.jpg",
                    description: 'A private beta launch for a new app.',
                    date_time: new Date(new Date().getTime() + 12 * 24 * 60 * 60 * 1000).toISOString(),
                    venue: 'Private Lounge',
                    location: 'San Francisco, CA',
                    is_public: false,
                    is_paid: false,
                    registration_fee: 0,
                    status: 'UPCOMING'
                },
                {
                    organizerId: demoOrganizer.id,
                    title: 'VIP Networking Dinner',
                    coverPhoto: "https://res.cloudinary.com/dxbpbbpbh/image/upload/v1772428697/download%20%281%29-1772428694900-496498378.jpg",
                    description: 'An invitation-only dinner with key industry figures.',
                    date_time: new Date(new Date().getTime() + 13 * 24 * 60 * 60 * 1000).toISOString(),
                    venue: 'Top Restaurant',
                    location: 'New York, NY',
                    is_public: false,
                    is_paid: true,
                    registration_fee: 100,
                    status: 'UPCOMING'
                },
                {
                    organizerId: demoOrganizer.id,
                    title: 'Private Workshop: Leadership Skills',
                    coverPhoto: "https://res.cloudinary.com/dxbpbbpbh/image/upload/v1772428697/download%20%281%29-1772428694900-496498378.jpg",
                    description: 'An exclusive workshop for senior executives.',
                    date_time: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                    venue: 'Leadership Academy',
                    location: 'Los Angeles, CA',
                    is_public: false,
                    is_paid: true,
                    registration_fee: 200,
                    status: 'UPCOMING'
                },
                {
                    organizerId: demoOrganizer.id,
                    title: 'Exclusive Product Demo',
                    coverPhoto: "https://res.cloudinary.com/dxbpbbpbh/image/upload/v1772428697/download%20%281%29-1772428694900-496498378.jpg",
                    description: 'A private product demo for investors.',
                    date_time: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
                    venue: 'Investor Lounge',
                    location: 'Miami, FL',
                    is_public: false,
                    is_paid: false,
                    registration_fee: 0,
                    status: 'UPCOMING'
                },
                {
                    organizerId: demoOrganizer.id,
                    title: 'Private Blockchain Meetup',
                    coverPhoto: "https://res.cloudinary.com/dxbpbbpbh/image/upload/v1772428697/download%20%281%29-1772428694900-496498378.jpg",
                    description: 'An invitation-only blockchain technology meetup.',
                    date_time: new Date(new Date().getTime() + 16 * 24 * 60 * 60 * 1000).toISOString(),
                    venue: 'Blockchain Hub',
                    location: 'Seattle, WA',
                    is_public: false,
                    is_paid: true,
                    registration_fee: 30,
                    status: 'UPCOMING'
                },
                {
                    organizerId: demoOrganizer.id,
                    title: 'Closed AI Roundtable',
                    coverPhoto: "https://res.cloudinary.com/dxbpbbpbh/image/upload/v1772428697/download%20%281%29-1772428694900-496498378.jpg",
                    description: 'A private roundtable for AI experts.',
                    date_time: new Date(new Date().getTime() + 17 * 24 * 60 * 60 * 1000).toISOString(),
                    venue: 'AI Labs',
                    location: 'Boston, MA',
                    is_public: false,
                    is_paid: true,
                    registration_fee: 50,
                    status: 'UPCOMING'
                },
                {
                    organizerId: demoOrganizer.id,
                    title: 'VIP Design Thinking Workshop',
                    coverPhoto: "https://res.cloudinary.com/dxbpbbpbh/image/upload/v1772428697/download%20%281%29-1772428694900-496498378.jpg",
                    description: 'A high-level design thinking workshop for top professionals.',
                    date_time: new Date(new Date().getTime() + 18 * 24 * 60 * 60 * 1000).toISOString(),
                    venue: 'Creative Suite',
                    location: 'Chicago, IL',
                    is_public: false,
                    is_paid: false,
                    registration_fee: 0,
                    status: 'UPCOMING'
                },
                {
                    organizerId: demoOrganizer.id,
                    title: 'Exclusive Coding Bootcamp',
                    coverPhoto: "https://res.cloudinary.com/dxbpbbpbh/image/upload/v1772428697/download%20%281%29-1772428694900-496498378.jpg",
                    description: 'An advanced coding bootcamp for selected participants.',
                    date_time: new Date(new Date().getTime() + 19 * 24 * 60 * 60 * 1000).toISOString(),
                    venue: 'Code Academy',
                    location: 'Austin, TX',
                    is_public: false,
                    is_paid: true,
                    registration_fee: 150,
                    status: 'UPCOMING'
                },
                {
                    organizerId: demoOrganizer.id,
                    title: 'Private Cybersecurity Workshop',
                    coverPhoto: "https://res.cloudinary.com/dxbpbbpbh/image/upload/v1772428697/download%20%281%29-1772428694900-496498378.jpg",
                    description: 'A hands-on workshop for cybersecurity professionals.',
                    date_time: new Date(new Date().getTime() + 20 * 24 * 60 * 60 * 1000).toISOString(),
                    venue: 'Security Lab',
                    location: 'Washington, D.C.',
                    is_public: false,
                    is_paid: true,
                    registration_fee: 75,
                    status: 'UPCOMING'
                }
            ]
        });

        console.log('Demo events created:', demoEventsCreate);


    });
};
