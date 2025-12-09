'use client';

import { Navbar } from '@/components/navbar';
import { FooterElement } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, DollarSign, RefreshCw, Check, X } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

import { getGameStartups, type GameStartup } from './actions';

// Mock data for game - in real app would fetch from API


function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(amount);
}

export default function GamePage() {
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);

    const [, setRound] = useState(1);
    const [allStartups, setAllStartups] = useState<GameStartup[]>([]);
    const [roundStartups, setRoundStartups] = useState<GameStartup[]>([]);
    const [revealed, setRevealed] = useState(false);
    const [loading, setLoading] = useState(true);

    const getNewRound = useCallback((startups: GameStartup[]) => {
        if (startups.length < 2) return [];
        return [...startups].sort(() => 0.5 - Math.random()).slice(0, 2);
    }, []);

    const startNewRound = useCallback(() => {
        if (allStartups.length < 2) return;
        setRoundStartups(getNewRound(allStartups));
        setRevealed(false);
    }, [allStartups, getNewRound]);

    const initialized = useRef(false);

    useEffect(() => {
        // Use setTimeout to avoid synchronous state update warning in useEffect
        const timer = setTimeout(async () => {
            if (!initialized.current) {
                try {
                    const fetchedStartups = await getGameStartups();
                    setAllStartups(fetchedStartups);
                    setRoundStartups(getNewRound(fetchedStartups));
                } catch (error) {
                    console.error('Failed to load game data', error);
                    toast.error('Failed to load game data');
                } finally {
                    setLoading(false);
                    initialized.current = true;
                }
            }

            // Load high score from local storage
            const savedHighScore = localStorage.getItem('trustmrr_game_highscore');
            if (savedHighScore) setHighScore(parseInt(savedHighScore));
        }, 0);

        return () => clearTimeout(timer);
    }, [getNewRound]);

    const handleGuess = (selectedIndex: number) => {
        if (revealed) return;

        setRevealed(true);
        const otherIndex = selectedIndex === 0 ? 1 : 0;
        const selected = roundStartups[selectedIndex];
        const other = roundStartups[otherIndex];

        if (selected.revenue >= other.revenue) {
            // Correct
            const newScore = score + 1;
            setScore(newScore);
            if (newScore > highScore) {
                setHighScore(newScore);
                localStorage.setItem('trustmrr_game_highscore', newScore.toString());
            }
            toast.success('Correct! +1 Point');
            setTimeout(() => {
                setRound(r => r + 1);
                startNewRound();
            }, 2000);
        } else {
            // Wrong
            toast.error('Game Over!');
            setScore(0);
            // Reset after delay
            setTimeout(() => {
                setRound(1);
                startNewRound();
            }, 3000);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
            <Navbar />

            <div className="container mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <Badge variant="secondary" className="mb-4">
                        <Trophy className="h-3 w-3 mr-2" />
                        Game Mode
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        $1 or $1,000,000?
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Which startup has higher monthly revenue?
                    </p>

                    <div className="flex justify-center gap-8 mt-8 text-lg font-medium">
                        <div className="bg-primary/10 px-4 py-2 rounded-lg">
                            Score: <span className="text-primary">{score}</span>
                        </div>
                        <div className="bg-muted px-4 py-2 rounded-lg">
                            High Score: {highScore}
                        </div>
                    </div>
                </div>

                {loading || roundStartups.length < 2 ? (
                    <div className="flex justify-center py-20 flex-col items-center gap-4">
                        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                        {loading && <p className="text-muted-foreground">Loading startups...</p>}
                        {!loading && roundStartups.length < 2 && (
                            <p className="text-muted-foreground">Not enough data to start the game.</p>
                        )}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center relative">
                        {/* VS Badge */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-background rounded-full p-2 shadow-xl border-4 border-muted">
                            <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl">
                                VS
                            </div>
                        </div>

                        {roundStartups.map((startup, index) => (
                            <Card
                                key={startup.id}
                                className={`cursor-pointer transition-all hover:scale-105 border-2 ${revealed
                                    ? startup.revenue >= roundStartups[index === 0 ? 1 : 0].revenue
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                        : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'hover:border-primary'
                                    }`}
                                onClick={() => handleGuess(index)}
                            >
                                <CardContent className="p-8 text-center flex flex-col items-center gap-6">
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage src={startup.logo || undefined} />
                                        <AvatarFallback className="text-2xl">{startup.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>

                                    <div>
                                        <h2 className="text-3xl font-bold mb-2">{startup.name}</h2>
                                        {revealed ? (
                                            <div className={`text-2xl font-bold flex items-center justify-center gap-2 ${startup.revenue >= roundStartups[index === 0 ? 1 : 0].revenue ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                <DollarSign className="h-6 w-6" />
                                                {formatCurrency(startup.revenue)}
                                            </div>
                                        ) : (
                                            <div className="text-2xl font-bold text-muted-foreground">
                                                $???
                                            </div>
                                        )}
                                    </div>

                                    {revealed && (
                                        <div className="absolute top-4 right-4">
                                            {startup.revenue >= roundStartups[index === 0 ? 1 : 0].revenue ? (
                                                <Check className="h-8 w-8 text-green-600" />
                                            ) : (
                                                <X className="h-8 w-8 text-red-600" />
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <FooterElement />
        </div>
    );
}
