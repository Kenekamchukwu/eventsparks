import { Bitcoin, Gem, Zap, CircleDot, Hexagon, Globe, Cpu, Link2, Box, Brain, Code, Users, Wrench, Video, Mountain, GraduationCap, Blocks, Monitor } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  Blockchain: <Blocks className="w-3.5 h-3.5" />,
  Bitcoin: <Bitcoin className="w-3.5 h-3.5" />,
  Ethereum: <Gem className="w-3.5 h-3.5" />,
  Solana: <Zap className="w-3.5 h-3.5" />,
  Base: <CircleDot className="w-3.5 h-3.5" />,
  TON: <Hexagon className="w-3.5 h-3.5" />,
  Cosmos: <Globe className="w-3.5 h-3.5" />,
  Polkadot: <Link2 className="w-3.5 h-3.5" />,
  "Multi-Chain": <Box className="w-3.5 h-3.5" />,
  Tech: <Monitor className="w-3.5 h-3.5" />,
  AI: <Brain className="w-3.5 h-3.5" />,
  "Tech Conference": <Cpu className="w-3.5 h-3.5" />,
  "Blockchain Conference": <Blocks className="w-3.5 h-3.5" />,
  Hackathon: <Code className="w-3.5 h-3.5" />,
  Meetup: <Users className="w-3.5 h-3.5" />,
  Workshop: <Wrench className="w-3.5 h-3.5" />,
  Webinar: <Video className="w-3.5 h-3.5" />,
  Summit: <Mountain className="w-3.5 h-3.5" />,
  Bootcamp: <GraduationCap className="w-3.5 h-3.5" />,
};

export const CategoryIcon = ({ category }: { category: string }) => {
  return iconMap[category] || null;
};
