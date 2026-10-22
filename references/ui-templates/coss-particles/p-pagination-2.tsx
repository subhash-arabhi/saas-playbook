// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-pagination-2.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import Link from "next/link";
import { Button } from "@/registry/default/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/registry/default/ui/pagination";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
};

export default function Particle({ currentPage, totalPages }: PaginationProps) {
  return (
    <Pagination>
      <PaginationContent className="w-full justify-between gap-2">
        <PaginationItem>
          <Button
            disabled={currentPage === 1}
            render={
              currentPage === 1 ? undefined : (
                <Link href={`#/page/${currentPage - 1}`} />
              )
            }
            variant="outline"
          >
            Previous
          </Button>
        </PaginationItem>
        <PaginationItem>
          <Button
            disabled={currentPage === totalPages}
            render={
              currentPage === totalPages ? undefined : (
                <Link href={`#/page/${currentPage + 1}`} />
              )
            }
            variant="outline"
          >
            Next
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
