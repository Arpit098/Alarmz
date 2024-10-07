"use client";
import React from "react";
import { Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Spinner } from "@nextui-org/react";
import { useInfiniteScroll } from "@nextui-org/use-infinite-scroll";
import axios from 'axios';

export default function Transaction() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [displayedTransactions, setDisplayedTransactions] = React.useState([]); // Displayed transactions
  const [bscTransactions, setBscTransactions] = React.useState([]);
  const [polygonTransactions, setPolygonTransactions] = React.useState([]);
  const [hasMore, setHasMore] = React.useState(false);
  const [currentChain, setCurrentChain] = React.useState(""); // Keep track of which chain is selected (BSC or Polygon)
  const [nextPageUrl, setNextPageUrl] = React.useState(null); // For pagination or "next" URL

  // Infinite scroll hook
  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore,
    onLoadMore: async () => {
      if (currentChain === "bsc") {
        await fetchBscTransactions(nextPageUrl); // Fetch next BSC transactions if available
      } else if (currentChain === "polygon") {
        await fetchPolygonTransactions(nextPageUrl); // Fetch next Polygon transactions if available
      }
    },
  });

  // Function to fetch BSC transactions with pagination
  const fetchBscTransactions = async (nextUrl = null) => {
    setIsLoading(true);
    setDisplayedTransactions([]); // Clear the displayed transactions when fetching new ones
    try {
      const url = nextUrl || 'https://api-testnet.bscscan.com/api?module=account&action=txlist&address=0x0034B0e1bA467744296d676B597470266803C1c8&startblock=0&endblock=99999999&sort=asc&apikey=NKRXUG3DVI7B4ESKUG15G6H6A9CMAI6NS9';
      const response = await axios.get(url);
      if (response.status === 200) {
        const transactions = response.data.result;
        setBscTransactions(transactions);
        setDisplayedTransactions(transactions); // Set the new transactions
        setNextPageUrl(null); // Set to null or the next URL if paginated
        setHasMore(false); // Adjust depending on whether more pages exist
        setCurrentChain("bsc");
        console.log("BSC Transactions fetched successfully");
      }
    } catch (error) {
      console.error("Error fetching BSC transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch Polygon transactions with pagination
  const fetchPolygonTransactions = async (nextUrl = null) => {
    setIsLoading(true);
    setDisplayedTransactions([]); // Clear the displayed transactions when fetching new ones
    try {
      const url = nextUrl || 'https://api-amoy.polygonscan.com/api?module=account&action=txlist&address=0x0034B0e1bA467744296d676B597470266803C1c8&startblock=0&endblock=99999999&sort=asc&apikey=AE5ZP8KQN1TN1A7CEY42I4XBWBMYYY568E';
      const response = await axios.get(url);
      if (response.status === 200) {
        const transactions = response.data.result;
        setPolygonTransactions(transactions);
        setDisplayedTransactions(transactions); // Set the new transactions
        setNextPageUrl(null); // Set to null or the next URL if paginated
        setHasMore(false); // Adjust depending on whether more pages exist
        setCurrentChain("polygon");
        console.log("Polygon Transactions fetched successfully");
      }
    } catch (error) {
      console.error("Error fetching Polygon transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mt-4">
        <p className="text-xl text-white">Transactions:</p>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => fetchBscTransactions()}>
            BSC
          </Button>
          <Button size="sm" onClick={() => fetchPolygonTransactions()}>
            Polygon
          </Button>
        </div>
      </div>

        <Table
          className="mt-4 max-h-[350px]"
          aria-label="Example table with infinite pagination"
          isHeaderSticky
          baseRef={scrollerRef}
          style={{ width: '100%' }}
        >
          <TableHeader>
            <TableColumn>From</TableColumn>
            <TableColumn>To</TableColumn>
            <TableColumn>Amount</TableColumn>
            <TableColumn>Time</TableColumn>
          </TableHeader>
          
            {displayedTransactions.length === 0 ? (
             <TableBody isLoading={isLoading} loadingContent={<Spinner color="white" />} emptyContent="No rows to display.">{[]}</TableBody>
           ) : (
             <TableBody isLoading={isLoading}
             loadingContent={<Spinner color="primary" />}>
               {displayedTransactions.map((tx) => (
                 <TableRow key={tx.block}>
                   <TableCell>{tx.from}</TableCell>
                   <TableCell>{tx.to}</TableCell>
                   <TableCell>{tx.value}</TableCell>
                   <TableCell>{new Date(tx.timeStamp * 1000).toLocaleString()}</TableCell>
                 </TableRow>
               ))}
             </TableBody>
           )}
          
        </Table>

      {hasMore && (
        <div ref={loaderRef} className="flex justify-center mt-4">
          <Spinner color="white" />
        </div>
      )}
    </>
  );
}
