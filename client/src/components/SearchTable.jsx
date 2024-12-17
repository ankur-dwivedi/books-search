import { Field } from "./ui/field";
import { Box, Center, Input, Text, VStack, Card, Stack } from "@chakra-ui/react";
import { AccordionRoot, AccordionItem, AccordionItemTrigger, AccordionItemContent } from "./ui/accordion";
import { Button } from "./ui/button";
import { HStack } from "@chakra-ui/react";
import { PaginationItems, PaginationNextTrigger, PaginationPrevTrigger, PaginationRoot } from "./ui/pagination";
import { useEffect, useState } from "react";
import { SkeletonText } from "./ui/skeleton";
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "./ui/menu";
import axios from "axios";

function SearchTable() {
  const [searchText, setSearchText] = useState("");
  const [pageCount, setPageCount] = useState(10);
  const [bookCount, setBookCount] = useState(null);
  const [page, setPage] = useState(1);
  const [books, setBooks] = useState([]);
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [statsData, setStatsData] = useState({
    earliestDate: null,
    latestDate: null,
    mostCommonAuthor: null,
    serverResponseTime: null,
  });

  const fetchBooks = async ({ query, startIndex = 0, maxResults = 10 }) => {
    const apiUrl = "http://localhost:4000/api/books";
    const apiKey = process.env.REACT_APP_API_KEY;
    setIsLoading(true);
    try {
      const params = {
        key: apiKey,
        startIndex,
        maxResults,
      };
      if (query) params["q"] = query;
      const response = await axios.get(apiUrl, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching books:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loadBooks = async (currentPage, currentPageCount) => {
    try {
      setError();
      if (currentPageCount) setPageCount(currentPageCount);
      setPage(currentPage);
      const startTime = performance.now();
      const result = await fetchBooks({
        query: searchText,
        startIndex: (currentPage - 1) * pageCount,
        maxResults: currentPageCount || pageCount,
      });
      const endTime = performance.now();
      if (!result.items || result.items.length === 0) {
        setError("No books found in the results.");
        setBooks([]);
        setBookCount(null);
        setStatsData({});
        return;
      }
      setBooks(result.items);
      setBookCount(result.totalItems);
      setStatsData((prev) => ({
        ...prev,
        serverResponseTime: `${(endTime - startTime).toFixed(2)} ms`,
      }));
    } catch (err) {
      setBooks([]);
      setBookCount(null);
      setStatsData({});
      setError(err?.message);
    }
  };

  useEffect(() => {
    if (books?.length) {
      const authorCounts = {};
      let earliestDate = null;
      let latestDate = null;
      books.forEach((book) => {
        const volumeInfo = book.volumeInfo;

        // Count authors
        if (volumeInfo.authors) {
          volumeInfo.authors.forEach((author) => {
            authorCounts[author] = (authorCounts[author] || 0) + 1;
          });
        }

        // Check publication dates
        if (volumeInfo.publishedDate) {
          const date = new Date(volumeInfo.publishedDate);
          if (!new Date(earliestDate) || date < new Date(earliestDate)) {
            earliestDate = volumeInfo.publishedDate;
          }
          if (!new Date(latestDate) || date > new Date(latestDate)) {
            latestDate = volumeInfo.publishedDate;
          }
        }
      });

      // Find the most common author
      const mostCommonAuthor = Object.entries(authorCounts).reduce((max, [author, count]) => (count > max.count ? { author, count } : max), {
        author: null,
        count: 0,
      });

      setStatsData((prev) => ({
        ...prev,
        mostCommonAuthor: mostCommonAuthor.author,
        earliestDate,
        latestDate,
      }));
    }
  }, [books]);

  return (
    <Center w="100vw">
      <Box>
        <VStack gap={10}>
          <VStack gap={10}>
            <Text as="h1" fontSize="4xl" fontWeight="bold" textAlign="center" color="teal.500" mt={8}>
              Welcome to books search demo app
            </Text>{" "}
            <HStack w="100%" alignItems={"flex-start"}>
              {" "}
              <Field invalid={error} errorText={error}>
                <Input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Type a keyword to search" />
              </Field>
              <Button
                variant={"outline"}
                loading={isLoading}
                loadingText="Loading..."
                disabled={!searchText || isLoading}
                onClick={() => {
                  loadBooks(1);
                }}
              >
                {"Search"}
              </Button>
              <MenuRoot onSelect={(e) => loadBooks(1, e.value)}>
                <MenuTrigger asChild>
                  <Button variant="outline" size="md">
                    {`Page size: ${pageCount}`}
                  </Button>
                </MenuTrigger>
                <MenuContent>
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={30}>30</MenuItem>
                </MenuContent>
              </MenuRoot>
            </HStack>
          </VStack>
          <VStack w={"50em"} gap={8}>
            {!isLoading && (
              <Stack gap="4" direction="row" wrap="wrap" w={"100%"}>
                {bookCount && (
                  <Card.Root minW="350px" h="150px">
                    <Card.Header>
                      <Card.Title>{bookCount}</Card.Title>
                      <Card.Description>Total number of results</Card.Description>
                    </Card.Header>
                  </Card.Root>
                )}
                {statsData.mostCommonAuthor && (
                  <Card.Root minW="350px" h="150px">
                    <Card.Header>
                      <Card.Title>{`${statsData.mostCommonAuthor}`}</Card.Title>
                      <Card.Description>Name of the single author who appears most commonly</Card.Description>
                    </Card.Header>
                  </Card.Root>
                )}
                {statsData.earliestDate && (
                  <Card.Root minW="250px" h="150px">
                    <Card.Header>
                      <Card.Title>{`${statsData.earliestDate}`}</Card.Title>
                      <Card.Description>Earliest publication date</Card.Description>
                    </Card.Header>
                  </Card.Root>
                )}
                {statsData.latestDate && (
                  <Card.Root minW="250px" h="150px">
                    <Card.Header>
                      <Card.Title>{`${statsData.latestDate}`}</Card.Title>
                      <Card.Description>Latest publication date</Card.Description>
                    </Card.Header>
                  </Card.Root>
                )}
                {statsData.serverResponseTime && (
                  <Card.Root minW="250px" h="150px">
                    <Card.Header>
                      <Card.Title>{`${statsData.serverResponseTime}`}</Card.Title>
                      <Card.Description>Server response time</Card.Description>
                    </Card.Header>
                  </Card.Root>
                )}
              </Stack>
            )}
            {!isLoading ? (
              <AccordionRoot multiple>
                {books?.map((item, index) => (
                  <AccordionItem key={index} value={index}>
                    <AccordionItemTrigger cursor="pointer">{`${item?.volumeInfo?.authors?.length ? `${item?.volumeInfo?.authors?.join(",")}-` : ""}${
                      item?.volumeInfo?.title
                    }`}</AccordionItemTrigger>
                    <AccordionItemContent>{item?.volumeInfo?.description || "No description to show"}</AccordionItemContent>
                  </AccordionItem>
                ))}
              </AccordionRoot>
            ) : (
              <SkeletonText height="1em" w="100%" noOfLines={pageCount} gap="4" />
            )}
            {books?.length > 0 ? (
              <PaginationRoot count={bookCount} pageSize={pageCount} page={page} onPageChange={(e) => loadBooks(e.page)}>
                <HStack>
                  <PaginationPrevTrigger />
                  <PaginationItems />
                  <PaginationNextTrigger />
                </HStack>
              </PaginationRoot>
            ) : (
              <></>
            )}
          </VStack>
        </VStack>
      </Box>
    </Center>
  );
}

export default SearchTable;
