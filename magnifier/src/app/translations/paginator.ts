import { MatPaginatorIntl } from "@angular/material/paginator";

const writeZe = (num :number) => {
    if ((Math.log10(num) + 1) % 3 === 0)
        return true;
    return false;
}

const polishRangeLabel = (page: number, pageSize: number, length: number) => {

    if (length == 0 || pageSize == 0) { return `0 z ${length}`; }
    
    length = Math.max(length, 0);
  
    const startIndex = page * pageSize;
  
    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = startIndex < length ?
        Math.min(startIndex + pageSize, length) :
        startIndex + pageSize;
  
    return (
        writeZe(length) 
        ? `${startIndex + 1} - ${endIndex} ze ${length}`
        : `${startIndex + 1} - ${endIndex} z ${length}`
    );
}

export const getPolishPaginatorIntl = () => {
    const paginatorIntl = new MatPaginatorIntl();

    paginatorIntl.itemsPerPageLabel = 'Przedmiotów na stronę:';
    paginatorIntl.firstPageLabel = 'Pierwsza strona';
    paginatorIntl.previousPageLabel = 'Poprzednia strona';
    paginatorIntl.nextPageLabel = 'Następna strona';
    paginatorIntl.lastPageLabel = 'Ostatnia strona';
    paginatorIntl.getRangeLabel = polishRangeLabel;

    return paginatorIntl;
}