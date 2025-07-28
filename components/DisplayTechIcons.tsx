import Image from "next/image";
import { cn, getTechLogos } from "@/lib/utils";

// Async component that displays tech icons based on a given tech stack
const DisplayTechIcons = async ({ techStack }: TechIconProps) => {
  // Fetch logos/URLs for the tech stack
  const techIcons = await getTechLogos(techStack);

  return (
    <div className="flex flex-row">
      {/* Display only the first 3 tech icons */}
      {techIcons.slice(0, 3).map(({ tech, url }, index) => (
        <div
          key={tech}
          className={cn(
            // Apply negative margin to overlap icons if not the first one
            "relative group bg-dark-300 rounded-full p-2 flex flex-center",
            index >= 1 && "-ml-3"
          )}
        >
          {/* Tooltip that shows tech name on hover */}
          <span className="tech-tooltip">{tech}</span>

          {/* Tech icon image */}
          <Image
            src={url}
            alt={tech}
            width={100}
            height={100}
            className="size-5"
          />
        </div>
      ))}
    </div>
  );
};

export default DisplayTechIcons;
