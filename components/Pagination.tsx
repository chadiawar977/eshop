import MuiPagination from "@mui/material/Pagination";

interface PaginationProps {
  count: number;
  page: number;
  onChange: (event: React.ChangeEvent<unknown>, page: number) => void;
}

export default function Pagination({ count, page, onChange }: PaginationProps) {
  return (
    <MuiPagination
      count={count}
      page={page}
      onChange={onChange}
      color="primary"
      size="large"
    />
  );
}
