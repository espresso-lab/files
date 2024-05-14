import { useRef, useState } from "react";
import {
  Text,
  Button,
  rem,
  Center,
  ActionIcon,
  Box,
  Loader,
  CopyButton,
  Tooltip,
} from "@mantine/core";
import { IconFilePlus, IconArrowDown } from "@tabler/icons-react";
import { Dropzone } from "@mantine/dropzone";

function Uploader() {
  const openRef = useRef<() => void>(null);
  const [filename, setFilename] = useState<string | undefined>();
  const [downloadLink, setDownloadLink] = useState<string | undefined>();
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isPending, setIsPending] = useState<boolean>(false);

  const uploadUrl =
    location.hostname === "localhost" ? "http://localhost:3000/upload-url" : "/upload-url";

  return (
    <>
      <Box
        p={15}
        display={"block"}
        m={0}
        pos={"absolute"}
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%",
          maxWidth: rem(500),
          pointerEvents: "none",
        }}
      >
        <Center mb={15}>
          <ActionIcon
            radius="lg"
            variant="gradient"
            size={100}
            gradient={
              isDragging
                ? { from: "red", to: "orange", deg: 109 }
                : { from: "grape", to: "indigo", deg: 113 }
            }
            onClick={() => {
              setDownloadLink(undefined);
              openRef.current?.();
            }}
            style={{ pointerEvents: "all" }}
          >
            {isPending ? (
              <Loader color="white" />
            ) : isDragging ? (
              <IconArrowDown style={{ width: rem(80), height: rem(80) }} stroke={1.5} />
            ) : (
              <IconFilePlus style={{ width: rem(80), height: rem(80) }} stroke={1.5} />
            )}
          </ActionIcon>
        </Center>

        <Text ta="center" size="xl" fw={600}>
          {isPending ? "Uploading..." : isDragging ? "Drop it like it's hot!" : "Upload files"}
        </Text>

        <Text size="sm" c="dimmed">
          <Center>
            {!isPending && !isDragging ? "Drag & drop files here to upload." : "\u00A0"}
          </Center>
        </Text>
      </Box>

      {downloadLink && (
        <Box
          display={"block"}
          m={0}
          pos={"absolute"}
          bottom={"5%"}
          left={"50%"}
          style={{
            transform: "translate(-50%, -50%)",
          }}
        >
          <CopyButton value={downloadLink}>
            {({ copied, copy }) => (
              <Tooltip label={filename}>
                <Button color={copied ? "teal" : "green"} onClick={copy}>
                  {copied ? "Copied url" : "Copy url"}
                </Button>
              </Tooltip>
            )}
          </CopyButton>
        </Box>
      )}

      <Dropzone.FullScreen
        openRef={openRef}
        active={true}
        onDragEnter={() => {
          setIsDragging(true);
          setDownloadLink(undefined);
        }}
        onDragLeave={() => {
          setIsDragging(false);
        }}
        onDrop={(files) => {
          setIsDragging(false);
          setDownloadLink(undefined);
          setIsPending(true);

          [...(files ?? [])].map(async (file) => {
            let { upload_url, download_url } = await fetch(uploadUrl, {
              method: "POST",
              body: JSON.stringify({
                file_name: file.name,
                expires_in_secs: 7 * 24 * 60 * 60, // 7 days
              }),
              headers: {
                "Content-Type": "application/json",
              },
            }).then((res) => res.json());

            const res = await fetch(upload_url, {
              method: "PUT",
              body: file,
            });

            setIsPending(false);

            if (!res.ok) {
              console.error("Failed to upload file");
            } else {
              setFilename(file.name);
              setDownloadLink(download_url);
              navigator.clipboard.writeText(download_url);
            }
          });
        }}
      >
        <div style={{ height: "100vh", width: "100vw", pointerEvents: "none" }}> </div>
      </Dropzone.FullScreen>
    </>
  );
}

export default Uploader;
